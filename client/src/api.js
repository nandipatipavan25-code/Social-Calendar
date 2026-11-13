const API_BASE = '/api';

export async function fetchCalendarData({
  postingMonth = '2026-11',
  dataAddedMonth = 'all',
  client = 'all',
  clients = [],
  search = ''
}) {
  const params = new URLSearchParams();
  if (postingMonth) params.set('postingMonth', postingMonth);
  if (dataAddedMonth) params.set('dataAddedMonth', dataAddedMonth);
  if (clients && clients.length > 0) {
    params.set('clients', clients.join(','));
  } else if (client && client !== 'all') {
    params.set('client', client);
  }
  if (search) params.set('search', search);

  const res = await fetch(`${API_BASE}/calendar?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch calendar data: ${res.statusText}`);
  }
  return res.json();
}

export async function syncData() {
  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Sync failed: ${res.statusText}`);
  }
  return res.json();
}

export async function createPost(postData) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create post');
  }
  return res.json();
}

export async function fetchAppsScript() {
  const res = await fetch(`${API_BASE}/apps-script`);
  if (!res.ok) {
    throw new Error('Failed to fetch Apps Script code');
  }
  return res.json();
}

export async function updateSheetUrl(sheetUrl) {
  const res = await fetch(`${API_BASE}/settings/sheet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetUrl })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update Google Sheet URL');
  }
  return res.json();
}
