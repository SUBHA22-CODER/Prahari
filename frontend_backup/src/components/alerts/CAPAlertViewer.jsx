import React, { useState } from 'react';
import { Copy, Check, Radio, FileCode } from 'lucide-react';

export default function CAPAlertViewer({ alert }) {
  const [copied, setCopied] = useState(false);
  const [viewFormat, setViewFormat] = useState('JSON');

  if (!alert) return null;

  const capObj = alert.cap_structure || {
    identifier: alert.id,
    sender: 'prahari-ai@ndma.gov.in',
    sent: alert.issued_at,
    status: 'Actual',
    msgType: 'Alert',
    scope: 'Public',
    info: {
      category: 'Safety',
      event: alert.hazard_type,
      urgency: 'Immediate',
      severity: alert.severity === 'CRITICAL' ? 'Extreme' : 'Severe',
      certainty: 'Observed',
      headline: `${alert.severity} RISK: ${alert.recommended_action}`,
      description: `Ward Impact Score ${alert.risk_score}/100. High exposure threat.`,
      instruction: alert.recommended_action,
      area: {
        areaDesc: alert.ward_name
      }
    }
  };

  const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${capObj.identifier}</identifier>
  <sender>${capObj.sender}</sender>
  <sent>${capObj.sent}</sent>
  <status>${capObj.status}</status>
  <msgType>${capObj.msgType}</msgType>
  <scope>${capObj.scope}</scope>
  <info>
    <category>${capObj.info.category}</category>
    <event>${capObj.info.event}</event>
    <urgency>${capObj.info.urgency}</urgency>
    <severity>${capObj.info.severity}</severity>
    <certainty>${capObj.info.certainty}</certainty>
    <headline>${capObj.info.headline}</headline>
    <description>${capObj.info.description}</description>
    <instruction>${capObj.info.instruction}</instruction>
    <area>
      <areaDesc>${capObj.info.area.areaDesc}</areaDesc>
    </area>
  </info>
</alert>`;

  const payloadText = viewFormat === 'XML' ? xmlString : JSON.stringify(capObj, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(payloadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* SACHET Simulation Warning Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-md p-3 text-xs space-y-1">
        <div className="flex items-center justify-between font-bold text-amber-900">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-amber-700 animate-pulse" />
            <span>CAP ALERT DISSEMINATION PIPELINE</span>
          </div>
          <span className="bg-amber-700 text-white font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
            SIMULATED DISSEMINATION
          </span>
        </div>
        <div className="text-amber-800 text-[11px]">
          Destination: <strong className="text-slate-900">NDMA SACHET National Portal</strong> | Status: <strong className="text-emerald-700">Simulated Dissemination Payload Prepared</strong>
        </div>
      </div>

      {/* Payload Header Controls */}
      <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-2 rounded-t-md text-xs">
        <div className="flex items-center space-x-2 font-mono">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span>CAP v1.2 Payload ({viewFormat})</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-800 p-0.5 rounded border border-slate-700 text-[10px]">
            <button
              onClick={() => setViewFormat('JSON')}
              className={`px-2 py-0.5 rounded font-mono ${viewFormat === 'JSON' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
            >
              JSON
            </button>
            <button
              onClick={() => setViewFormat('XML')}
              className={`px-2 py-0.5 rounded font-mono ${viewFormat === 'XML' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
            >
              XML
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded text-[11px] font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Textarea */}
      <pre className="bg-slate-950 text-emerald-400 p-3 rounded-b-md text-[11px] font-mono overflow-x-auto max-h-60 border-x border-b border-slate-800 leading-relaxed selection:bg-blue-800 selection:text-white">
        {payloadText}
      </pre>
    </div>
  );
}
