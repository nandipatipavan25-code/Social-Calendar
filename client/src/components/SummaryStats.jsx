import React from 'react';
import { Users, CalendarCheck, Layers, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, Sheet, Settings } from 'lucide-react';

export default function SummaryStats({ 
  stats, 
  syncing, 
  onSync, 
  postingMonth,
  dataAddedMonth,
  onOpenAppsScript,
  onOpenSheetConfig
}) {
  const formatSyncTime = (iso) => {
    if (!iso) return 'Not yet synced';
    try {
      const dt = new Date(iso);
      return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const isLive = stats.syncSource && stats.syncSource.includes('Live');

  return (
    <div className="bg-white border-b border-zinc-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
      {/* Metric badges */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Clients in View</div>
            <div className="text-sm font-bold text-zinc-900 leading-tight">
              {stats.activeClientsCount || 0}{' '}
              <span className="text-xs font-normal text-zinc-400">/ {stats.totalDatabaseClients || 0} total</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Scheduled Posts</div>
            <div className="text-sm font-bold text-zinc-900 leading-tight">
              {stats.filteredPostsCount || 0}{' '}
              <span className="text-xs font-normal text-zinc-400">posts</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Multi-Post Days</div>
            <div className="text-sm font-bold text-zinc-900 leading-tight">
              {stats.multiPostCount || 0}{' '}
              <span className="text-xs font-normal text-zinc-400">client-days (✓ 2+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync and Google Sheet Controls */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Source Status Pill */}
        <button
          type="button"
          onClick={onOpenSheetConfig}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition cursor-pointer"
          title="Click to view or change Google Sheet connection"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="font-semibold">Live Google Sheet</span>
          <span className="text-[11px] text-emerald-700">({formatSyncTime(stats.lastSyncTime)})</span>
          <Settings className="w-3 h-3 text-emerald-700 ml-0.5 opacity-70" />
        </button>

        {/* Refresh Data button */}
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-2xs disabled:opacity-50 cursor-pointer"
          title="Pull live changes from your Google Sheet"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Refresh Sheet Data'}</span>
        </button>

        <a
          href={stats.sheetUrl || `https://docs.google.com/spreadsheets/d/${stats.googleSheetId || '1vHL3J2mBLyxLTvrBeh6O9U2LFNGOcjetWKTN2kEu55o'}/edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition"
          title="Open Google Sheet in new tab"
        >
          <span>Open Sheet</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>

        <button
          type="button"
          onClick={onOpenAppsScript}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition font-medium cursor-pointer"
          title="Set up automatic row creation timestamp tracking"
        >
          <span>Apps Script Tracker</span>
        </button>
      </div>
    </div>
  );
}
