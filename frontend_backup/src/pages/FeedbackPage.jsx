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
      setLoading(true);
      const wardList = await api.getWards(selectedDistrict);
      const history = await api.getFeedbackHistory();
      setWards(wardList);
      setFeedbackHistory(history);
      setLoading(false);
    }
    loadData();
  }, [selectedDistrict]);

  const handleSubmitFeedback = async (payload) => {
    const res = await api.submitFeedback(payload);
    const updatedHistory = await api.getFeedbackHistory();
    setFeedbackHistory(updatedHistory);
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
        <RecalibrationChart />
      </div>

      {/* Ground Truth Log History */}
      <div className="bg-white p-4 rounded-md border border-slate-200 space-y-3">
        <div className="flex items-center space-x-2 border-b pb-2 border-slate-100">
          <History className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
            RECENT GROUND-TRUTH LOGS
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          {feedbackHistory.map((item) => (
            <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-start">
              <div>
                <div className="font-bold text-slate-900">{item.ward_name}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">{item.official_notes}</div>
                <div className="text-[10px] text-slate-400 mt-1">{formatDate(item.timestamp)}</div>
              </div>
              <div className="text-right">
                <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                  {item.actual_outcome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
