import React, { useState, useEffect, useCallback, useRef } from 'react';
import HeaderFilters from './components/HeaderFilters';
import SummaryStats from './components/SummaryStats';
import CalendarMatrix from './components/CalendarMatrix';
import PostDetailsModal from './components/PostDetailsModal';
import NewPostModal from './components/NewPostModal';
import AppsScriptModal from './components/AppsScriptModal';
import SheetConfigModal from './components/SheetConfigModal';
import { fetchCalendarData, syncData } from './api';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

function resolveInitialNineClients(clientList) {
  if (!clientList || clientList.length === 0) return [];
  const targetTerms = [
    'dr rajesh reddy',
    'clear skin',
    'clearskin',
    'brain to spine',
    'healing hastha',
    'ga digital',
    'ga consulting',
    'ga hiresync',
    'ga hire sync',
    'pave path',
    'jdp'
  ];

  const matched = [];
  targetTerms.forEach(term => {
    const cleanTerm = term.replace(/[^a-z0-9]/g, '');
    const found = clientList.find(c => {
      const cleanName = (c.name || c).toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanName.includes(cleanTerm) || cleanTerm.includes(cleanName);
    });
    if (found) {
      const name = found.name || found;
      if (!matched.includes(name)) {
        matched.push(name);
      }
    }
  });

  return matched;
}

export default function App() {
  const [calendarData, setCalendarData] = useState({
    matrix: {},
    dates: [],
    clients: [],
    allClients: [],
    availablePostingMonths: [],
    availableDataAddedMonths: [],
    lastSyncTime: null,
    syncSource: '',
    syncStatus: 'success',
    googleSheetId: '',
    sheetUrl: '',
    totalDatabaseClients: 0,
    totalDatabasePosts: 0,
    activeClientsCount: 0,
    filteredPostsCount: 0,
    multiPostCount: 0
  });

  const [postingMonth, setPostingMonth] = useState('2026-11');
  const [dataAddedMonth, setDataAddedMonth] = useState('all');
  const [selectedClients, setSelectedClients] = useState([]);
  const [initialNineClients, setInitialNineClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [compactMode, setCompactMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const hasInitializedClients = useRef(false);

  // Modals state
  const [activeModal, setActiveModal] = useState({
    open: false,
    posts: [],
    clientName: '',
    date: ''
  });
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [appsScriptModalOpen, setAppsScriptModalOpen] = useState(false);
  const [sheetConfigModalOpen, setSheetConfigModalOpen] = useState(false);

  const loadData = useCallback(async (customClientsOverride = null) => {
    try {
      setLoading(true);
      const clientsToQuery = customClientsOverride !== null ? customClientsOverride : selectedClients;
      const data = await fetchCalendarData({
        postingMonth,
        dataAddedMonth,
        clients: clientsToQuery,
        search: searchQuery
      });
      setCalendarData(data);

      // On initial load, dynamically resolve the 9 priority clients from Google Sheet client list
      if (!hasInitializedClients.current && data.allClients && data.allClients.length > 0) {
        hasInitializedClients.current = true;
        const initialNine = resolveInitialNineClients(data.allClients);
        setInitialNineClients(initialNine);
        setSelectedClients(initialNine);
        // Trigger reload with the initial 9 clients
        const nineData = await fetchCalendarData({
          postingMonth,
          dataAddedMonth,
          clients: initialNine,
          search: searchQuery
        });
        setCalendarData(nineData);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.message || 'Failed to load calendar' });
      setLoading(false);
    }
  }, [postingMonth, dataAddedMonth, selectedClients, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Refresh Data / Live Synchronization
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncData();
      await loadData();
      setToast({
        type: res.warning ? 'warning' : 'success',
        message: res.message || 'Successfully synchronized with live Google Sheets.'
      });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: err.message || 'Synchronization failed.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleCellClick = (clientName, date, posts) => {
    setActiveModal({
      open: true,
      posts,
      clientName,
      date
    });
  };

  const handleResetToday = () => {
    setPostingMonth('2026-11');
    setDataAddedMonth('all');
    setSelectedClients(initialNineClients);
    setSearchQuery('');
  };

  // Close toast automatically
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const activeAllClients = calendarData.allClients && calendarData.allClients.length > 0
    ? calendarData.allClients
    : (calendarData.clients || []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 font-sans text-zinc-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-2 fade-in">
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-xl border text-xs font-medium ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header with All Filters */}
      <HeaderFilters
        postingMonth={postingMonth}
        setPostingMonth={setPostingMonth}
        dataAddedMonth={dataAddedMonth}
        setDataAddedMonth={setDataAddedMonth}
        selectedClients={selectedClients}
        setSelectedClients={setSelectedClients}
        initialNineClients={initialNineClients}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        availablePostingMonths={calendarData.availablePostingMonths || []}
        availableDataAddedMonths={calendarData.availableDataAddedMonths || []}
        allClients={activeAllClients}
        onOpenNewPost={() => setNewPostModalOpen(true)}
        onResetToday={handleResetToday}
        compactMode={compactMode}
        setCompactMode={setCompactMode}
      />

      {/* Summary KPI Bar */}
      <SummaryStats
        stats={calendarData}
        syncing={syncing}
        onSync={handleSync}
        postingMonth={postingMonth}
        dataAddedMonth={dataAddedMonth}
        onOpenAppsScript={() => setAppsScriptModalOpen(true)}
        onOpenSheetConfig={() => setSheetConfigModalOpen(true)}
      />

      {/* Calendar Matrix View */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-2xs flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Updating Calendar Matrix...</span>
            </div>
          </div>
        )}

        <CalendarMatrix
          matrix={calendarData.matrix}
          dates={calendarData.dates}
          clients={calendarData.clients}
          onSelectCell={handleCellClick}
          compactMode={compactMode}
          todayStr="2026-11-13"
        />
      </main>

      {/* Modal: View Post Details on Checkmark Click */}
      {activeModal.open && (
        <PostDetailsModal
          posts={activeModal.posts}
          clientName={activeModal.clientName}
          date={activeModal.date}
          onClose={() => setActiveModal({ open: false, posts: [], clientName: '', date: '' })}
        />
      )}

      {/* Modal: Add New Post */}
      {newPostModalOpen && (
        <NewPostModal
          clients={activeAllClients}
          initialPostingDate={`${postingMonth !== 'all' ? postingMonth : '2026-11'}-16`}
          initialClient={selectedClients.length === 1 ? selectedClients[0] : ''}
          onSuccess={() => {
            setNewPostModalOpen(false);
            setToast({ type: 'success', message: 'New post scheduled and Data Entry timestamp recorded!' });
            loadData();
          }}
          onClose={() => setNewPostModalOpen(false)}
        />
      )}

      {/* Modal: Google Apps Script Code */}
      {appsScriptModalOpen && (
        <AppsScriptModal onClose={() => setAppsScriptModalOpen(false)} />
      )}

      {/* Modal: Google Sheet Configuration / Live Sync */}
      {sheetConfigModalOpen && (
        <SheetConfigModal
          currentSheetUrl={calendarData.sheetUrl}
          currentSheetId={calendarData.googleSheetId}
          onClose={() => setSheetConfigModalOpen(false)}
          onSuccess={(result) => {
            setSheetConfigModalOpen(false);
            setToast({ type: 'success', message: result.message || 'Live Google Sheet synchronized!' });
            loadData();
          }}
        />
      )}
    </div>
  );
}
