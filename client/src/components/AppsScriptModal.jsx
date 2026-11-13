import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Code, ShieldCheck, Info } from 'lucide-react';
import { fetchAppsScript } from '../api';

export default function AppsScriptModal({ onClose }) {
  const [code, setCode] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppsScript()
      .then((data) => {
        setCode(data.code);
        setSheetId(data.sheetId);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-900">Google Apps Script Timestamp Tracker</h3>
              <p className="text-xs text-zinc-500">Automate real-time data entry timestamps in Google Sheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-700">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-blue-950">
              <Info className="w-4 h-4 text-blue-700" />
              How Google Sheets Timestamp Tracking Works
            </div>
            <p className="leading-relaxed">
              Google Sheets does not expose row creation timestamps retroactively for past edits. 
              By installing this script into your Google Sheets workbook, an automatic <strong>onEdit</strong> trigger 
              records the exact creation date/time in a <code>DATA_ENTRY_DATE</code> column whenever a new post row is added, 
              guaranteeing 100% accurate data-entry tracking for all future posts!
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider">Installation Instructions (1 minute)</h4>
            <ol className="list-decimal list-inside space-y-1 text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              <li>Open your Google Sheet: <a href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`} target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline inline-flex items-center gap-0.5">Open Workbook <ExternalLink className="w-3 h-3" /></a></li>
              <li>Click <strong>Extensions</strong> &gt; <strong>Apps Script</strong> in the top menu bar.</li>
              <li>Delete any existing template code and paste the code snippet below.</li>
              <li>Click the <strong>Save</strong> icon (Ctrl+S). Done! It will now auto-timestamp all new rows!</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700 text-xs">Code Snippet:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-900 text-white rounded text-xs font-medium flex items-center gap-1 transition shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed max-h-60 border border-zinc-800">
              {loading ? 'Loading script...' : code}
            </pre>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Preserves original creation timestamp on subsequent edits
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
