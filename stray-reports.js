// Stray Reports page logic (detailed view + NGO actions + notifications)

let cachedLatestId = null;
let volunteersCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadReports(1);
  await loadVolunteers();
  startPolling();
});

function apiBase(url) {
  const sameOrigin = (window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : '';
  return [
    `https://straycare-api.onrender.com${url}`,
    sameOrigin ? `${sameOrigin}${url}` : null,
    `http://localhost:3000${url}`,
    `http://127.0.0.1:3000${url}`
  ].filter(Boolean);
}

async function fetchJsonWithFallback(url) {
  let lastErr;
  for (const u of apiBase(url)) {
    try {
      const res = await fetch(u);
      const data = await res.json();
      if (res.ok) return data;
      lastErr = new Error(data?.error || `Request failed (${res.status})`);
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Request failed');
}

async function postJsonWithFallback(url, body) {
  let lastErr;
  for (const u of apiBase(url)) {
    try {
      const res = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) return data;
      lastErr = new Error(data?.error || `Request failed (${res.status})`);
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Request failed');
}

async function patchJsonWithFallback(url, body) {
  let lastErr;
  for (const u of apiBase(url)) {
    try {
      const res = await fetch(u, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
      const data = await res.json();
      if (res.ok) return data;
      lastErr = new Error(data?.error || `Request failed (${res.status})`);
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Request failed');
}

async function uploadFileWithFallback(url, formData) {
  let lastErr;
  for (const u of apiBase(url)) {
    try {
      const res = await fetch(u, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) return data;
      lastErr = new Error(data?.error || `Request failed (${res.status})`);
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Request failed');
}

async function loadVolunteers() {
  try {
    const data = await fetchJsonWithFallback('/api/volunteers');
    volunteersCache = data?.volunteers || [];
  } catch (e) {
    volunteersCache = [];
  }
}

async function loadReports(page) {
  const container = document.getElementById('reportsContainer');
  container.innerHTML = '<div class="loading-message"><p>Loading reports...</p></div>';
  try {
    const data = await fetchJsonWithFallback(`/api/stray-reports?page=${page}&limit=24`);
    renderReports(container, data.items || []);
    setupPagination(data.page, data.pages);
    if ((data.items || []).length) cachedLatestId = (data.items[0]._id || data.items[0].id || null);
  } catch (err) {
    console.error('Failed to fetch stray reports:', err);
    container.innerHTML = '<div class="loading-message"><p>Could not load reports. Ensure the server is running.</p></div>';
  }
}

function renderReports(container, items) {
  if (!items.length) {
    container.innerHTML = '<div class="loading-message"><p>No reports yet.</p></div>';
    return;
  }
  container.innerHTML = items.map(r => reportCard(r)).join('');
  // Wire actions
  items.forEach(r => wireActions(r));
}

function mediaTag(url) {
  if (!url) return '';
  const lower = url.toLowerCase();
  const origin = (window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : 'https://straycare-api.onrender.com';
  const abs = url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg')) {
    return `<video src="${abs}" controls style="width:100%;max-height:200px;object-fit:cover"></video>`;
  }
  return `<img src="${abs}" alt="report media" style="width:100%;height:200px;object-fit:cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'">`;
}

function reportCard(r) {
  const created = new Date(r.createdAt);
  const time = created.toLocaleString();
  const title = `${capitalize(r.type)} — ${capitalize(r.condition)}`;
  const coords = (r.lat != null && r.lng != null) ? `(${r.lat.toFixed(4)}, ${r.lng.toFixed(4)})` : '';
  const location = [r.locationText, coords].filter(Boolean).join(' ');
  const maps = (r.lat != null && r.lng != null) ? `https://www.google.com/maps?q=${r.lat},${r.lng}` : '';
  const priority = r.priority || 'medium';
  const status = r.status || 'pending';
  const media = (r.mediaUrls && r.mediaUrls.length) ? mediaTag(r.mediaUrls[0]) : '<img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop" alt="placeholder" style="width:100%;height:200px;object-fit:cover">';
  const volunteerOptions = (volunteersCache || []).map(v => `<option value="${v.name}">${v.name}</option>`).join('');
  const comments = (r.ngoComments || []).map(c => `<li><strong>${escapeHtml(c.author || 'NGO')}:</strong> ${escapeHtml(c.text)} <span class="small">(${new Date(c.createdAt).toLocaleString()})</span></li>`).join('');
  return `
    <div class="case-card" id="report-${r._id}">
      <div class="case-image">
        ${media}
        <span class="priority-badge ${priority}">${priority}</span>
      </div>
      <div class="case-info">
        <h3>${title}</h3>
        <p>Status: <span class="status-badge ${status}">${status}</span></p>
        <p>Reporter: ${escapeHtml(r.reporterName || 'Anonymous')} ${r.reporterPhone ? `• ${escapeHtml(r.reporterPhone)}` : ''} ${r.reporterEmail ? `• ${escapeHtml(r.reporterEmail)}` : ''}</p>
        <p>Location: ${escapeHtml(location || 'Unknown')} ${maps ? `• <a href="${maps}" target="_blank" rel="noopener">Open in Maps</a>` : ''}</p>
        <p>Reported: ${time}</p>

        <div class="actions" style="margin-top:10px">
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">
            <label>
              <span class="small">Assign Volunteer</span>
              <select id="assign-${r._id}"><option value="">Select</option>${volunteerOptions}</select>
            </label>
            <button class="mini-btn" data-action="assign" data-id="${r._id}">Assign</button>
            <button class="mini-btn" data-action="checkin" data-id="${r._id}">Volunteer Check-in</button>
            <label class="mini-btn outline" style="position:relative; overflow:hidden">
              Upload Proof<input type="file" accept="image/*,video/*" data-action="proof" data-id="${r._id}" style="opacity:0;position:absolute;left:0;top:0;width:100%;height:100%;cursor:pointer">
            </label>
            <label>
              <span class="small">Status</span>
              <select id="status-${r._id}">
                <option value="pending" ${status==='pending'?'selected':''}>Pending</option>
                <option value="in-progress" ${status==='in-progress'?'selected':''}>In Progress</option>
                <option value="resolved" ${status==='resolved'?'selected':''}>Resolved</option>
                <option value="not-found" ${status==='not-found'?'selected':''}>Not Found</option>
              </select>
            </label>
            <button class="mini-btn" data-action="update-status" data-id="${r._id}">Update</button>
          </div>

          <div style="margin-top:10px">
            <h4>Comments</h4>
            <ul id="comments-${r._id}" style="padding-left:18px">${comments || '<li class="small">No comments yet</li>'}</ul>
            <div style="display:flex;gap:8px;margin-top:6px">
              <input type="text" placeholder="Add comment" id="comment-input-${r._id}" style="flex:1">
              <button class="mini-btn" data-action="add-comment" data-id="${r._id}">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function wireActions(r) {
  const root = document.getElementById(`report-${r._id}`);
  if (!root) return;
  root.querySelectorAll('[data-action]').forEach(el => {
    const id = el.getAttribute('data-id');
    const action = el.getAttribute('data-action');
    if (action === 'assign') {
      el.onclick = async () => {
        const name = document.getElementById(`assign-${id}`).value;
        if (!name) return notify('Select a volunteer to assign');
        await patchJsonWithFallback(`/api/stray-reports/${id}/assign`, { volunteerName: name });
        notify(`Assigned ${name}`);
        await refreshReportCard(id);
      };
    } else if (action === 'checkin') {
      el.onclick = async () => {
        await patchJsonWithFallback(`/api/stray-reports/${id}/checkin`);
        notify('Volunteer checked-in');
        await refreshReportCard(id);
      };
    } else if (action === 'update-status') {
      el.onclick = async () => {
        const status = document.getElementById(`status-${id}`).value;
        await patchJsonWithFallback(`/api/stray-reports/${id}/status`, { status });
        notify('Status updated');
        await refreshReportCard(id);
      };
    } else if (action === 'add-comment') {
      el.onclick = async () => {
        const input = document.getElementById(`comment-input-${id}`);
        const text = (input.value || '').trim();
        if (!text) return;
        await postJsonWithFallback(`/api/stray-reports/${id}/comments`, { text, author: 'NGO' });
        input.value = '';
        await refreshReportCard(id);
      };
    } else if (action === 'proof') {
      el.onchange = async (evt) => {
        const file = evt.target.files && evt.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('proof', file);
        await uploadFileWithFallback(`/api/stray-reports/${id}/proof`, fd);
        notify('Proof uploaded');
        await refreshReportCard(id);
        evt.target.value = '';
      };
    }
  });
}

async function refreshReportCard(id) {
  // Fetch the first page to find the updated report quickly
  const data = await fetchJsonWithFallback('/api/stray-reports?page=1&limit=24');
  const updated = (data.items || []).find(x => (x._id || x.id) === id);
  if (!updated) return;
  const root = document.getElementById(`report-${id}`);
  if (!root) return;
  root.outerHTML = reportCard(updated);
  wireActions(updated);
}

function setupPagination(current, total) {
  const sel = document.getElementById('pageSelect');
  sel.innerHTML = '';
  for (let i = 1; i <= total; i++) {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `Page ${i} / ${total}`;
    if (i === current) opt.selected = true;
    sel.appendChild(opt);
  }
  sel.onchange = () => loadReports(parseInt(sel.value));
}

function startPolling() {
  setInterval(async () => {
    try {
      const data = await fetchJsonWithFallback('/api/stray-reports?page=1&limit=1');
      const latest = (data.items || [])[0];
      const latestId = latest?._id || latest?.id || null;
      if (latestId && cachedLatestId && latestId !== cachedLatestId) {
        cachedLatestId = latestId;
        notify('New stray report received. Refresh to view.', true);
      } else if (latestId && !cachedLatestId) {
        cachedLatestId = latestId;
      }
    } catch (_) { /* ignore */ }
  }, 15000);
}

function notify(message, sticky = false) {
  const panel = document.getElementById('notifyPanel');
  if (!panel) return alert(message);
  panel.style.display = 'block';
  panel.textContent = message;
  if (!sticky) setTimeout(() => { panel.style.display = 'none'; }, 5000);
}

function capitalize(s) { return (s || '').charAt(0).toUpperCase() + (s || '').slice(1); }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
