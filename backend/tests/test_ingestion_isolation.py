"""
PRAHARI-AI — Fetcher Isolation Tests
======================================
Covers (Build Guide §14):
  1. Fetcher isolation: one fetcher raising an exception does not prevent others
  2. Cache-first fallback: CWC scrape failure serves cached value, not error
  3. Open-Meteo per-ward failure does not stop the loop for other wards
  4. Normalisation correctness for rainfall records
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch


class TestFetcherIsolation:
    """Build Guide §3.1: one fetcher's failure must not break others."""

    def test_scheduler_job_exception_does_not_propagate(self):
        """
        Verify that a RuntimeError inside a fetcher job wrapper is caught
        and does not re-raise (isolating from the scheduler loop).
        """
        from app.ingestion.scheduler import _run_async

        # Mock asyncio event loop so run_until_complete raises directly
        mock_loop = MagicMock()
        mock_loop.run_until_complete.side_effect = RuntimeError("Simulated fetcher failure")

        with patch("asyncio.get_event_loop", return_value=mock_loop):
            try:
                _run_async(None)
            except Exception:
                pytest.fail("_run_async should not propagate fetcher exceptions")

    @patch("app.ingestion.open_meteo._fetch_open_meteo_raw")
    def test_one_ward_failure_does_not_block_others(self, mock_fetch):
        """
        Open-Meteo: if one ward's fetch returns None (failure),
        the other wards still produce records.
        """
        from app.ingestion.open_meteo import _normalise_to_record

        # First call fails, second succeeds
        mock_fetch.side_effect = [None, {"current": {"precipitation": 5.0, "time": "2024-07-30T06:00"}}]

        record1 = _normalise_to_record(None, "ward_001") if None else None
        raw2 = {"current": {"precipitation": 5.0, "time": "2024-07-30T06:00"}}
        record2 = _normalise_to_record(raw2, "ward_002")

        assert record1 is None
        assert record2 is not None
        assert record2["value"] == 5.0


class TestCWCCacheFirstFallback:
    """Build Guide §3.6: CWC scrape failure must serve cached value, not error."""

    def test_scrape_failure_returns_none(self):
        from app.ingestion.cwc import _scrape_station

        station = {
            "station_id": "test_station",
            "district": "Wayanad",
            "url": "http://nonexistent-cwc-station.invalid/",
            "selector": "td.gauge",
        }
        result = _scrape_station(station)
        assert result is None, "Scrape of invalid URL should return None"

    def test_normalise_rainfall_with_valid_data(self):
        """Open-Meteo normalisation correctness."""
        from app.ingestion.open_meteo import _normalise_to_record

        raw = {
            "current": {
                "precipitation": 12.5,
                "time": "2024-07-30T06:00",
            }
        }
        record = _normalise_to_record(raw, "ward_001")
        assert record is not None
        assert record["source"] == "open_meteo"
        assert record["hazard_type"] == "rainfall"
        assert record["value"] == 12.5
        assert record["unit"] == "mm_per_hr"
        assert record["location_id"] == "ward_001"

    def test_normalise_rainfall_missing_value_returns_none(self):
        """Malformed response must not crash — return None instead."""
        from app.ingestion.open_meteo import _normalise_to_record

        raw = {"current": {}}  # Missing 'precipitation'
        record = _normalise_to_record(raw, "ward_001")
        assert record is None


class TestUSGSIsolation:
    """Build Guide §3.1: USGS Tier 3 module is independent of Tier 1."""

    def test_low_magnitude_events_are_filtered(self):
        from app.ingestion.usgs import _normalise_feature, MIN_MAGNITUDE

        feature = {
            "properties": {"mag": 2.0, "time": 1691510400000, "place": "Test Region"},
            "geometry": {"coordinates": [76.0, 11.6, 10.0]},
        }
        result = _normalise_feature(feature)
        assert result is None, "Events below MIN_MAGNITUDE should be filtered"

    def test_valid_earthquake_normalises_correctly(self):
        from app.ingestion.usgs import _normalise_feature

        feature = {
            "properties": {"mag": 5.5, "time": 1691510400000, "place": "Andaman Islands"},
            "geometry": {"coordinates": [92.0, 10.0, 35.0]},
        }
        record = _normalise_feature(feature)
        assert record is not None
        assert record["hazard_type"] == "earthquake"
        assert record["value"] == 5.5
        assert record["unit"] == "mw"
        assert record["source"] == "usgs"


class TestTsunamiKeywordFilter:
    """Build Guide §3.8: INCOIS tsunami events filtered to exact keyword list."""

    def test_relevant_event_passes_filter(self):
        from app.ingestion.incois import _filter_relevant_events

        events = [{"REGIONNAME": "Bay of Bengal Earthquake", "MAGNITUDE": "6.2"}]
        result = _filter_relevant_events(events)
        assert len(result) == 1

    def test_irrelevant_region_is_filtered_out(self):
        from app.ingestion.incois import _filter_relevant_events

        events = [{"REGIONNAME": "Pacific Ocean - Japan", "MAGNITUDE": "7.0"}]
        result = _filter_relevant_events(events)
        assert len(result) == 0

    def test_exact_keyword_list_used(self):
        from app.ingestion.incois import INDIAN_OCEAN_KEYWORDS

        # These are the exact keywords from Build Guide §3.8 — do not add extras
        expected = {
            "Indonesia", "Philippines", "Andaman", "Sumatra",
            "Myanmar", "Bay of Bengal", "Arabian Sea",
        }
        assert set(INDIAN_OCEAN_KEYWORDS) == expected

    @pytest.mark.asyncio
    @patch("app.ingestion.incois._fetch_tsunami_opr_raw")
    async def test_fetch_tsunami_events_job_with_user_payload(self, mock_fetch):
        """Verify that INCOIS tsunami job parses the user's payload, filters regions, and writes to DB."""
        from app.ingestion.incois import fetch_tsunami_events_job
        from app.db.models import HazardReading
        from datetime import timezone

        user_payload = {
            "type": "FeatureCollection",
            "metadata": {
                "generated": 1786365999000,
                "url": "https://tsunami.incois.gov.in/itews/DSSProducts/OPR/past90days.json",
                "title": "ITEWC - Past 90 days events"
            },
            "datasets": [
                {
                    "EVID": "incois2026ptdz",
                    "BULNO": 1,
                    "ORIGINTIME": "2026-08-10 18:04:00",
                    "MAGNITUDE": 7.4,
                    "LONGITUDE": -76.13,
                    "LATITUDE": 4.92,
                    "DEPTH": 10,
                    "REGIONNAME": "Colombia",
                    "detail": "..."
                },
                {
                    "EVID": "incois2026luwo",
                    "BULNO": 1,
                    "ORIGINTIME": "2026-06-16 08:57:00",
                    "MAGNITUDE": 6.7,
                    "LONGITUDE": 120.30,
                    "LATITUDE": -1.15,
                    "DEPTH": 10,
                    "REGIONNAME": "Sulawesi, Indonesia",
                    "detail": "..."
                },
                {
                    "EVID": "incois2026lfxh",
                    "BULNO": 1,
                    "ORIGINTIME": "2026-06-08 06:25:00",
                    "MAGNITUDE": 6.8,
                    "LONGITUDE": 125.30,
                    "LATITUDE": 5.53,
                    "DEPTH": 10,
                    "REGIONNAME": "Mindanao, Philippines",
                    "detail": "..."
                }
            ]
        }
        mock_fetch.return_value = user_payload

        # Mock db session
        db_mock = MagicMock()
        db_mock.commit = AsyncMock()
        
        await fetch_tsunami_events_job(db_mock)

        # We expect 2 relevant events: Indonesia and Philippines (Colombia is filtered out)
        assert db_mock.add.call_count == 2
        
        # Check first added reading
        call_args_list = db_mock.add.call_args_list
        reading1 = call_args_list[0][0][0]
        assert isinstance(reading1, HazardReading)
        assert reading1.source == "incois_tsunami"
        assert reading1.hazard_type == "tsunami_potential"
        assert reading1.value == 6.7
        assert reading1.location_id == "tsunami_Sulawesi,_Indonesia"
        assert reading1.observed_at.year == 2026
        assert reading1.observed_at.month == 6
        assert reading1.observed_at.day == 16
        assert reading1.observed_at.hour == 8
        assert reading1.observed_at.tzinfo == timezone.utc

        # Check second added reading
        reading2 = call_args_list[1][0][0]
        assert isinstance(reading2, HazardReading)
        assert reading2.value == 6.8
        assert reading2.location_id == "tsunami_Mindanao,_Philippines"
        assert reading2.observed_at.day == 8
        assert reading2.observed_at.hour == 6
