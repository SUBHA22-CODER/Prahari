import React, { useState } from 'react';
import { MessageSquarePlus, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function FeedbackForm({ wards = [], onSubmitFeedback }) {
  const [selectedWardId, setSelectedWardId] = useState(wards[0]?.ward_id || 'W14');
  const [outcome, setOutcome] = useState('CONFIRMED');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const currentWard = wards.find(w => w.ward_id === selectedWardId) || wards[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ward_id: selectedWardId,
      ward_name: currentWard?.ward_name || selectedWardId,
      predicted_impact: `${currentWard?.risk_band} (${currentWard?.risk_score})`,
      actual_outcome: outcome,
      official_notes: notes
    };

    onSubmitFeedback(payload);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setNotes('');
  };

  return (
    <div className="bg-white p-4 rounded-md border border-slate-200 space-y-4 shadow-xs">
      <div className="flex items-center space-x-2 border-b pb-2 border-slate-100">
        <MessageSquarePlus className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
          OFFICIAL FIELD IMPACT FEEDBACK
        </h3>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-md text-emerald-900 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>MODEL FEEDBACK RECORDED</span>
          </div>
          <p className="text-emerald-800">
            Ground-truth observation submitted. The risk weighting factors have updated for demonstration of recalibration.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Select Ward */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Select Ward Corridor
            </label>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500"
            >
              {wards.map(w => (
                <option key={w.ward_id} value={w.ward_id}>
                  {w.ward_name} (Score: {w.risk_score} - {w.risk_band})
                </option>
              ))}
            </select>
          </div>

          {/* Predicted Impact Display */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 font-medium">Model Predicted Impact:</span>
            <span className="font-mono font-extrabold text-blue-900">
              {currentWard?.risk_band} (Score {currentWard?.risk_score})
            </span>
          </div>

          {/* Actual Outcome Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Actual Field Outcome
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CONFIRMED', label: 'Confirmed', desc: 'Disaster event occurred' },
                { id: 'PARTIALLY_CONFIRMED', label: 'Partially Confirmed', desc: 'Minor impact' },
                { id: 'FALSE_ALARM', label: 'False Alarm', desc: 'No hazard recorded' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOutcome(opt.id)}
                  className={`p-2 rounded border text-left transition-colors ${
                    outcome === opt.id 
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold' 
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[9px] text-slate-500 font-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Official Observations / Field Notes
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Local flood depth reached 1.2m at bridge; slope slippage recorded."
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-md text-xs tracking-wider uppercase transition-colors"
          >
            Submit Ground-Truth Feedback
          </button>
        </form>
      )}
    </div>
  );
}
