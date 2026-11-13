import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  CalendarDays,
  X,
  Users,
  CheckSquare
} from 'lucide-react';
import MultiClientSelector from './MultiClientSelector';

export default function HeaderFilters({
  postingMonth,
  setPostingMonth,
  dataAddedMonth,
  setDataAddedMonth,
  selectedClients = [],
  setSelectedClients,
  initialNineClients = [],
  searchQuery,
  setSearchQuery,
  availablePostingMonths = [],
  availableDataAddedMonths = [],
  allClients = [],
  onOpenNewPost,
  onResetToday,
  compactMode,
  setCompactMode
}) {
  const [showMultiModal, setShowMultiModal] = useState(false);

  // Month navigation: previous month
  const handlePrevMonth = () => {
    if (postingMonth === 'all') return;
    const idx = availablePostingMonths.indexOf(postingMonth);
    if (idx > 0) {
      setPostingMonth(availablePostingMonths[idx - 1]);
    } else {
      const [y, m] = postingMonth.split('-').map(Number);
      const prevDate = new Date(y, m - 2, 1);
      const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      setPostingMonth(prevStr);
    }
  };

  // Month navigation: next month
  const handleNextMonth = () => {
    if (postingMonth === 'all') return;
    const idx = availablePostingMonths.indexOf(postingMonth);
    if (idx >= 0 && idx < availablePostingMonths.length - 1) {
      setPostingMonth(availablePostingMonths[idx + 1]);
    } else {
      const [y, m] = postingMonth.split('-').map(Number);
      const nextDate = new Date(y, m, 1);
      const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
      setPostingMonth(nextStr);
    }
  };

  const formatMonthName = (ymStr) => {
    if (!ymStr || ymStr === 'all') return 'All Months';
    if (ymStr === 'Not Available') return 'Historical (Not Available)';
    try {
      const [y, m] = ymStr.split('-');
      const dt = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return ymStr;
    }
  };

  // Determine current client dropdown value
  const isAllClients = selectedClients.length === 0 || selectedClients.length === allClients.length;
  const isInitialNine = !isAllClients && 
    initialNineClients.length > 0 && 
    selectedClients.length === initialNineClients.length &&
    initialNineClients.every(name => selectedClients.includes(name));
  const isSingleClient = selectedClients.length === 1;

  let clientDropdownValue = 'all';
  if (isInitialNine) {
    clientDropdownValue = 'initial-nine';
  } else if (isSingleClient) {
    clientDropdownValue = selectedClients[0];
  } else if (!isAllClients) {
    clientDropdownValue = 'custom-multiple';
  }

  const handleClientDropdownChange = (e) => {
    const val = e.target.value;
    if (val === 'all') {
      setSelectedClients([]);
    } else if (val === 'initial-nine') {
      setSelectedClients(initialNineClients);
    } else if (val === 'custom-multiple') {
      setShowMultiModal(true);
    } else {
      // Single client selected
      setSelectedClients([val]);
    }
  };

  const isCustomClientFilterActive = selectedClients.length > 0 && selectedClients.length < allClients.length;

  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-3.5 space-y-2.5 sticky top-0 z-40 shadow-xs">
      {/* Top Header: Title, Live Sync badge & Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-tight">
                Social Media Posting Calendar
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Consolidated Matrix
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Dynamically connected to Google Sheet ({allClients.length} clients detected)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Compact / Comfortable view toggle */}
          <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50 text-xs">
            <button
              type="button"
              onClick={() => setCompactMode(false)}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                !compactMode ? 'bg-white shadow-2xs text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Comfortable
            </button>
            <button
              type="button"
              onClick={() => setCompactMode(true)}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                compactMode ? 'bg-white shadow-2xs text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Compact View
            </button>
          </div>

          {/* New Post Button */}
          <button
            type="button"
            onClick={onOpenNewPost}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 1. Monthly Dropdown (Select One Month or All Months) */}
        <div className="flex items-center border border-zinc-300 rounded-lg bg-white overflow-hidden shadow-2xs text-xs">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={postingMonth === 'all'}
            className="p-2 hover:bg-zinc-100 text-zinc-600 disabled:opacity-30 border-r border-zinc-200 transition cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white">
            <CalendarDays className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-zinc-500 font-medium">Month:</span>
            <select
              value={postingMonth}
              onChange={(e) => setPostingMonth(e.target.value)}
              className="bg-transparent font-semibold text-zinc-900 focus:outline-hidden text-xs py-1 cursor-pointer"
            >
              <option value="all">All Months (View All)</option>
              {availablePostingMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {formatMonthName(ym)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={postingMonth === 'all'}
            className="p-2 hover:bg-zinc-100 text-zinc-600 disabled:opacity-30 border-l border-zinc-200 transition cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Today Button */}
        <button
          type="button"
          onClick={onResetToday}
          className="px-2.5 py-1.5 border border-zinc-300 hover:bg-zinc-100 rounded-lg text-xs font-medium text-zinc-700 transition cursor-pointer"
          title="Jump to Current Month (Nov 2026)"
        >
          Today
        </button>

        {/* 2. Client Dropdown – Dynamic List from Google Sheet */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 rounded-lg bg-white text-xs shadow-2xs">
          <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-zinc-500 font-medium">Client:</span>
          <select
            value={clientDropdownValue}
            onChange={handleClientDropdownChange}
            className="bg-transparent font-semibold text-zinc-900 focus:outline-hidden text-xs max-w-[210px] truncate cursor-pointer"
          >
            <option value="initial-nine">
              Initial Selection (9 Clients)
            </option>
            <option value="all">
              All Clients ({allClients.length})
            </option>
            {isCustomClientFilterActive && !isInitialNine && !isSingleClient && (
              <option value="custom-multiple">
                Custom Selection ({selectedClients.length} clients)
              </option>
            )}
            <option disabled>──────────────</option>
            {allClients.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.totalPosts})
              </option>
            ))}
          </select>
        </div>

        {/* Multi-Client Customizer Button (Pop-up with checkboxes) */}
        <MultiClientSelector
          allClients={allClients}
          selectedClients={selectedClients}
          onChangeSelectedClients={setSelectedClients}
          initialNineClients={initialNineClients}
        />

        {/* 3. Data Added Month Filter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 rounded-lg bg-white text-xs shadow-2xs">
          <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-zinc-500 font-medium">Data Added Month:</span>
          <select
            value={dataAddedMonth}
            onChange={(e) => setDataAddedMonth(e.target.value)}
            className="bg-transparent font-semibold text-zinc-900 focus:outline-hidden text-xs cursor-pointer"
          >
            <option value="all">All Data Added Months</option>
            {availableDataAddedMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthName(m)}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Client Search Field */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search client, topic or creative..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-emerald-600 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Client Tag Chips (when a custom subset of clients is selected) */}
      {isCustomClientFilterActive && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs border-t border-zinc-100">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mr-1">
            {isInitialNine ? 'Initial 9 Clients Active:' : `Selected Clients (${selectedClients.length}):`}
          </span>
          {selectedClients.map((cName) => (
            <span
              key={cName}
              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium text-[11px]"
            >
              <span>{cName}</span>
              <button
                type="button"
                onClick={() => setSelectedClients(selectedClients.filter((n) => n !== cName))}
                className="hover:text-red-600 rounded-full p-0.5 transition cursor-pointer"
                title={`Remove ${cName}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setSelectedClients([])}
            className="text-[11px] text-zinc-500 hover:text-zinc-900 underline font-medium ml-1 cursor-pointer"
          >
            View all clients ({allClients.length} total)
          </button>
        </div>
      )}
    </header>
  );
}
