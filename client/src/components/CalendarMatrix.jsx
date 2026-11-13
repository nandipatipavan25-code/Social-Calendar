import React, { useRef } from 'react';
import { Check, Calendar } from 'lucide-react';

export default function CalendarMatrix({
  matrix,
  dates,
  clients,
  onSelectCell,
  compactMode,
  todayStr = '2026-11-13' // Local time in system metadata
}) {
  const containerRef = useRef(null);

  const getDayInfo = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dayNum = dt.getDate();
      const weekday = dt.toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
      const monthAbbr = dt.toLocaleDateString('en-US', { month: 'short' });
      const dayOfWeek = dt.getDay(); // 0 is Sun, 6 is Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isToday = dateStr === todayStr;

      return { dayNum, weekday, monthAbbr, isWeekend, isToday };
    } catch {
      return { dayNum: dateStr, weekday: '', monthAbbr: '', isWeekend: false, isToday: false };
    }
  };

  if (!clients || clients.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-zinc-800 text-sm">No clients match your filter criteria</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Try clearing your search query or selecting "All Clients" or "All Months" to view posting schedules.
        </p>
      </div>
    );
  }

  if (!dates || dates.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-zinc-800 text-sm">No dates available for this view</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          No scheduled posts were found for the selected combination of Posting Month and Data Added Month.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-auto bg-white border-t border-zinc-200 select-none"
      style={{ maxHeight: 'calc(100vh - 180px)' }}
    >
      <table className="w-full border-separate border-spacing-0 text-left text-xs">
        {/* Sticky Header Row */}
        <thead>
          <tr>
            {/* Top-Left Corner Header (Sticky Left + Sticky Top) */}
            <th 
              scope="col"
              className="sticky top-0 left-0 z-30 bg-white border-b border-r border-zinc-200 px-4 py-2.5 font-bold text-zinc-700 w-64 min-w-[240px] max-w-[280px] shadow-[2px_2px_4px_-1px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between">
                <span>Client Name ({clients.length})</span>
                <span className="text-[10px] text-zinc-400 font-normal uppercase tracking-wider">Posts</span>
              </div>
            </th>

            {/* Date Column Headers (Sticky Top) */}
            {dates.map((dStr) => {
              const { dayNum, weekday, monthAbbr, isWeekend, isToday } = getDayInfo(dStr);

              return (
                <th
                  key={dStr}
                  scope="col"
                  className={`sticky top-0 z-20 border-b border-r border-zinc-200 text-center transition-colors ${
                    compactMode ? 'px-1 py-1 min-w-[34px] max-w-[42px]' : 'px-2 py-2 min-w-[44px] max-w-[54px]'
                  } ${
                    isToday
                      ? 'bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-500'
                      : isWeekend
                      ? 'bg-zinc-50/80 text-zinc-500'
                      : 'bg-white text-zinc-700'
                  }`}
                  title={`${dStr} (${monthAbbr} ${dayNum})`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium opacity-75 uppercase leading-none">
                      {weekday}
                    </span>
                    <span className={`font-bold mt-0.5 leading-tight ${compactMode ? 'text-xs' : 'text-sm'} ${
                      isToday ? 'text-emerald-700 underline decoration-2 underline-offset-2' : ''
                    }`}>
                      {dayNum}
                    </span>
                    {!compactMode && (
                      <span className="text-[9px] text-zinc-400 font-normal leading-none mt-0.5">
                        {monthAbbr}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Matrix Table Body */}
        <tbody>
          {clients.map((clientObj, rowIdx) => {
            const clientName = clientObj.name;
            const clientPostsByDate = matrix[clientName] || {};

            return (
              <tr 
                key={clientName} 
                className="hover:bg-zinc-50/70 transition-colors group"
              >
                {/* Sticky Left Column: Client Name */}
                <td className="sticky left-0 z-10 bg-white group-hover:bg-zinc-50/95 border-b border-r border-zinc-200 px-4 py-2 font-medium text-zinc-900 w-64 min-w-[240px] max-w-[280px] truncate shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-zinc-800" title={clientName}>
                      {clientName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-normal shrink-0">
                      {clientObj.totalPosts || 0}
                    </span>
                  </div>
                </td>

                {/* Day Cells */}
                {dates.map((dStr) => {
                  const postsOnDate = clientPostsByDate[dStr] || [];
                  const hasPost = postsOnDate.length > 0;
                  const count = postsOnDate.length;
                  const { isWeekend, isToday } = getDayInfo(dStr);

                  return (
                    <td
                      key={dStr}
                      className={`border-b border-r border-zinc-200 text-center transition-colors ${
                        compactMode ? 'p-0.5 h-8' : 'p-1 h-10'
                      } ${
                        isToday
                          ? 'bg-emerald-50/30'
                          : isWeekend
                          ? 'bg-zinc-50/40'
                          : ''
                      }`}
                    >
                      {hasPost ? (
                        <button
                          type="button"
                          onClick={() => onSelectCell(clientName, dStr, postsOnDate)}
                          className={`w-full h-full rounded-md flex items-center justify-center font-bold transition transform active:scale-95 cursor-pointer shadow-2xs ${
                            count > 1
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] ring-2 ring-emerald-300'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs'
                          }`}
                          title={`Click to view: ${count} post(s) for ${clientName} on ${dStr}\nTopic: ${postsOnDate[0].topic || postsOnDate[0].postType}`}
                        >
                          <span className="flex items-center justify-center gap-0.5">
                            <Check className={compactMode ? 'w-3 h-3 stroke-[3]' : 'w-3.5 h-3.5 stroke-[3]'} />
                            {count > 1 && <span className="text-[10px] font-black">{count}</span>}
                          </span>
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 font-light select-none">
                          <span className="opacity-40">-</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
