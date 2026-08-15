import React, { useState, useEffect } from 'react';
import FeedbackForm from '../components/feedback/FeedbackForm';
import RecalibrationChart from '../components/feedback/RecalibrationChart';
import { api } from '../services/api';
import { MessageSquareDiff, History } from 'lucide-react';
import { formatDate } from '../utils/formatting';

export default function FeedbackPage({ selectedDistrict }) {
  const [wards, setWards] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const wardList = await api.getWards(selectedDistrict);
      const history = await api.getFeedbackHistory();
      setWards(wardList);
      setFeedbackHistory(history);
      setLoading(false);
    }
    loadData();

    // Live auto-refresh polling every 3 seconds
    const interval = setInterval(async () => {
      const history = await api.getFeedbackHistory();
      setFeedbackHistory(history);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedDistrict]);

  const handleSubmitFeedback = async (payload) => {
    await api.submitFeedback(payload);
    const updatedHistory = await api.getFeedbackHistory();
    setFeedbackHistory(updatedHistory);
  };

  const getBadgeStyle = (outcome = '') => {
    const text = outcome.toLowerCase();
    if (text.includes('occurred') || text.includes('executed')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (text.includes('false') || text.includes('penalty')) {
      return 'bg-rose-100 text-rose-800 border-rose-300';
    }
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  if (loading) return <div className="h-64 bg-slate-200 animate-pulse rounded-md"></div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-md border border-slate-200 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquareDiff className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              OFFICIAL FEEDBACK & RECALIBRATION
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log official ground-truth observations to demonstrate weight recalibration and false alarm reduction.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Feedback Input Form */}
        <FeedbackForm wards={wards} onSubmitFeedback={handleSubmitFeedback} />

        {/* Recalibration Visualizer */}
        <RecalibrationChart feedbackHistory={feedbackHistory} />
      </div>

      {/* Ground Truth Log History */}
      <div className="bg-white p-4 rounded-md border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b pb-2 border-slate-100">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              RECENT GROUND-TRUTH LOGS
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200 animate-pulse">
            ● LIVE AUTO-SYNC (3s)
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {feedbackHistory.map((item) => (
            <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-start hover:border-slate-300 transition-colors">
              <div>
                <div className="font-bold text-slate-900 flex items-center space-x-2">
                  <span>{item.ward_name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({item.official_role})</span>
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">{item.official_notes || item.feedback_type}</div>
                <div className="text-[10px] text-slate-400 mt-1">{formatDate(item.timestamp)}</div>
              </div>
              <div className="text-right space-y-1">
                <span className={`font-extrabold text-[10px] px-2.5 py-1 rounded border inline-block ${getBadgeStyle(item.actual_outcome)}`}>
                  {item.actual_outcome}
                </span>
                <div className="text-[10px] text-blue-600 font-semibold">{item.feedback_type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
