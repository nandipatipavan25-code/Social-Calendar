import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, CheckCircle2, Sheet, ArrowRight } from 'lucide-react';
import { updateSheetUrl } from '../api';

export default function SheetConfigModal({ 
  currentSheetUrl, 
  currentSheetId, 
  onClose, 
  onSuccess 
}) {
  const [sheetInput, setSheetInput] = useState(currentSheetUrl || `https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sheetInput.trim()) return;

    setSyncing(true);
    setError(null);

    try {
      const result = await updateSheetUrl(sheetInput.trim());
      onSuccess(result);
    } catch (err) {
      setError(err.message || 'Failed to sync with this Google Sheet');
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-900">Live Google Sheet Connection</h3>
              <p className="text-xs text-zinc-500">Live sync directly from your master Google Sheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-xs text-emerald-900">
                Connected Master Spreadsheet
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                The application pulls all 48 client worksheet tabs directly from your Google Sheet workbook.
                Any edits, dates, or new posts added to your Google Sheet are synchronized live.
              </p>
            </div>
          </div>

          <div>
            <label className="font-medium text-zinc-700 block mb-1">
              Google Sheet URL or Spreadsheet ID
            </label>
            <input
              type="text"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1vHL3J2mBLyxLTvrBeh6O9U2LFNGOcjetWKTN2kEu55o/edit"
              required
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Paste the full link or the spreadsheet ID of the sheet you are currently using.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <div className="text-zinc-600 text-[11px]">
              <span>Active ID: </span>
              <strong className="text-zinc-900 font-mono">{currentSheetId || '1vHL3J2mBLyxLTvrBeh6O9U2LFNGOcjetWKTN2kEu55o'}</strong>
            </div>
            <a
              href={`https://docs.google.com/spreadsheets/d/${currentSheetId || '1vHL3J2mBLyxLTvrBeh6O9U2LFNGOcjetWKTN2kEu55o'}/edit`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 text-xs"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 hover:bg-zinc-100 rounded-lg text-zinc-700 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={syncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing Live Sheet...' : 'Sync Live Sheet Data'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
