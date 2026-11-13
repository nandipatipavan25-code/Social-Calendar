import React, { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown, Check, X, Search, CheckSquare, Square, Sparkles } from 'lucide-react';

export default function MultiClientSelector({
  allClients = [],
  selectedClients = [],
  onChangeSelectedClients,
  initialNineClients = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter clients by search query inside dropdown
  const filteredClients = allClients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.trim().toLowerCase())
  );

  const isAllSelected = selectedClients.length === 0 || selectedClients.length === allClients.length;

  const handleToggleClient = (clientName) => {
    if (isAllSelected) {
      // If currently all selected, clicking one isolates that one client
      onChangeSelectedClients([clientName]);
      return;
    }

    if (selectedClients.includes(clientName)) {
      const next = selectedClients.filter(name => name !== clientName);
      onChangeSelectedClients(next);
    } else {
      onChangeSelectedClients([...selectedClients, clientName]);
    }
  };

  const handleSelectAll = () => {
    onChangeSelectedClients([]); // empty means all clients
  };

  const handleSelectInitialNine = () => {
    if (initialNineClients.length > 0) {
      onChangeSelectedClients(initialNineClients);
    }
  };

  const handleClearAll = () => {
    onChangeSelectedClients([]);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Multi-Select Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-semibold text-zinc-700 shadow-2xs transition cursor-pointer"
        title="Check/Uncheck multiple clients"
      >
        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
        <span>Checklist Filter</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-76 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          {/* Popover Header with Search */}
          <div className="p-2.5 border-b border-zinc-100 bg-zinc-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1 bg-white border border-zinc-200 rounded-md text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-emerald-600"
                autoFocus
              />
              {clientSearch && (
                <button
                  type="button"
                  onClick={() => setClientSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between pt-2 px-0.5 text-[11px] gap-1">
              <span className="text-zinc-500 font-medium">
                {isAllSelected 
                  ? `All ${allClients.length} active`
                  : `${selectedClients.length} of ${allClients.length} selected`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectInitialNine}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
                  title="Reset to Initial 9 Clients"
                >
                  Initial 9
                </button>
                <span className="text-zinc-300">|</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                >
                  All
                </button>
                <span className="text-zinc-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-zinc-500 hover:text-zinc-800 font-medium cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Client Checkbox List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredClients.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400">
                No clients match "{clientSearch}"
              </div>
            ) : (
              filteredClients.map((client) => {
                const isChecked = isAllSelected || selectedClients.includes(client.name);

                return (
                  <div
                    key={client.name}
                    onClick={() => handleToggleClient(client.name)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition select-none ${
                      isChecked && !isAllSelected
                        ? 'bg-emerald-50 text-emerald-950 font-medium'
                        : 'hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-zinc-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{client.name}</span>
                    </div>

                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 shrink-0 font-normal">
                      {client.totalPosts || 0}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-2 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-500">
              Auto-syncs with Google Sheet
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-900 text-white text-[11px] font-semibold rounded-md transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
