// ── CrisisNexus Sidebar + Global Socket Manager ──────────────────────────────

(function () {
  // Inject external deps
  const deps = [
    { tag: 'link', rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css' },
    { tag: 'link', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap' },
  ];
  deps.forEach(d => {
    const el = document.createElement(d.tag);
    Object.keys(d).filter(k => k !== 'tag').forEach(k => el[k] = d[k]);
    document.head.appendChild(el);
  });

  const navItems = [
    { id: 'admin',     href: 'admin.html',     icon: 'fa-border-all',         label: 'Command Center' },
    { id: 'sos',       href: 'sos.html',        icon: 'fa-satellite-dish',     label: 'SOS Broadcast',   sos: true },
    { id: 'alerts',    href: 'alerts.html',     icon: 'fa-triangle-exclamation', label: 'Alert Logs' },
    { id: 'map',       href: 'map.html',        icon: 'fa-map-location-dot',   label: 'Live Topography' },
    { id: 'personnel', href: 'personnel.html',  icon: 'fa-users-viewfinder',   label: 'Response Units' },
    { id: 'comms',     href: 'comms.html',      icon: 'fa-walkie-talkie',      label: 'Crisis Comms' },
    { id: 'settings',  href: 'settings.html',   icon: 'fa-sliders',            label: 'System Config' },
  ];

  const sidebarHTML = `
    <aside class="sidebar" id="globalSidebar">
      <div class="sidebar-header">
        <div class="logo-icon"><i class="fa-solid fa-shield-halved"></i></div>
        <div>
          <div class="logo-text">Crisis<span>Nexus</span></div>
        </div>
        <span class="sidebar-version">v2.0</span>
      </div>

      <div class="sidebar-section-label">Navigation</div>
      <nav class="sidebar-nav">
        ${navItems.map(n => `
          <a href="${n.href}" id="nav-${n.id}" ${n.sos ? 'class="sos-nav-link"' : ''}>
            <i class="fa-solid ${n.icon}"></i>
            <span>${n.label}</span>
            ${n.id === 'alerts' ? '<span class="nav-badge" id="active-badge" style="display:none">0</span>' : ''}
          </a>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <div class="status-indicator">
          <div class="pulse-dot" id="ws-dot" style="background:var(--accent-yellow)"></div>
          <span id="ws-status">Connecting...</span>
        </div>
        <div class="client-count">Clients online: <span id="client-count">—</span></div>
        <div style="font-size:0.7rem;color:var(--text-muted);font-family:var(--font-mono)" id="server-time">—</div>
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  // Highlight active nav
  const page = location.pathname.split('/').pop() || 'admin.html';
  const pageId = page.replace('.html', '');
  const activeLink = document.getElementById('nav-' + pageId);
  if (activeLink) activeLink.classList.add('active');

  // Clock
  function updateClock() {
    const el = document.getElementById('server-time');
    if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ── Toast System ────────────────────────────────────────
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  window.showToast = function (title, body, type = 'info', duration = 5000) {
    const icons = { info: '📡', success: '✅', warning: '⚠️', critical: '🚨', error: '❌' };
    const colors = { info: 'var(--accent-cyan)', success: 'var(--accent-green)', warning: 'var(--accent-yellow)', critical: 'var(--accent-red)', error: 'var(--accent-red)' };
    const tc = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'critical' ? 'toast-critical' : ''}`;
    toast.style.borderLeftColor = colors[type] || colors.info;
    toast.style.borderLeftWidth = '3px';
    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-body">${body}</div>
      </div>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;margin-left:auto;font-size:1rem">✕</button>
    `;
    tc.appendChild(toast);
    if (type === 'critical') {
      // Play alert sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [440, 550, 440].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = f;
          osc.type = 'square';
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.15);
          osc.start(ctx.currentTime + i * 0.2);
          osc.stop(ctx.currentTime + i * 0.2 + 0.15);
        });
      } catch (e) {}
    }
    setTimeout(() => {
      toast.style.animation = 'slide-out 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ── Socket.IO Connection ─────────────────────────────────
  function initSocket() {
    if (typeof io === 'undefined') {
      setTimeout(initSocket, 500);
      return;
    }
    const socket = window._crisisSocket = io({ transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      document.getElementById('ws-dot').style.background = 'var(--accent-green)';
      document.getElementById('ws-status').textContent = 'System Online';
    });

    socket.on('disconnect', () => {
      document.getElementById('ws-dot').style.background = 'var(--accent-red)';
      document.getElementById('ws-status').textContent = 'Reconnecting...';
    });

    socket.on('system:clients', (n) => {
      const el = document.getElementById('client-count');
      if (el) el.textContent = n;
    });

    socket.on('alert:new', (alert) => {
      window.showToast(`🚨 New ${alert.type} Alert`, `${alert.location} — ${alert.severity} severity`, alert.severity === 'Critical' ? 'critical' : 'warning');
      updateActiveBadge();
    });

    socket.on('alert:critical', (data) => {
      document.title = `🚨 CRITICAL — ${data.type} | CrisisNexus`;
      setTimeout(() => { document.title = 'CrisisNexus'; }, 6000);
    });

    socket.on('alert:resolved', () => {
      updateActiveBadge();
    });

    socket.on('alert:updated', () => {
      updateActiveBadge();
    });

    // Heartbeat
    setInterval(() => socket.emit('ping'), 30000);
  }

  async function updateActiveBadge() {
    try {
      const res = await fetch('/api/alerts?status=ACTIVE&limit=1');
      const d = await res.json();
      // get count from stats instead
      const sr = await fetch('/api/alerts/stats');
      const sd = await sr.json();
      const badge = document.getElementById('active-badge');
      if (badge && sd.success) {
        const count = sd.stats.active;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
      }
    } catch (e) {}
  }

  // Load socket.io client script then init
  const script = document.createElement('script');
  script.src = '/socket.io/socket.io.js';
  script.onload = initSocket;
  document.head.appendChild(script);

  // Initial badge fetch
  setTimeout(updateActiveBadge, 1000);
})();
