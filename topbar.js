// =============================================================
// Persistent dashboard bottom navigation bar.
// Drop this on any page with:
//     <script src="topbar.js" defer></script>
// Self-injects a fixed bottom tab bar (Instagram-style) with
// live progress counts for Goals, Stack, Water, Gym, Finance.
// The Water tab includes a quick +1 button that logs a drink
// from any page and syncs to Supabase when configured.
// =============================================================
(function () {
  'use strict';

  const TOPBAR_SUPABASE_URL = 'https://gyzcznmwpxkrkywlanwx.supabase.co';
  const TOPBAR_SUPABASE_KEY = 'sb_publishable_pujL4fo2h8YOHBmNP2ryCQ_SSghLFZX';

  // -------- CSS --------
  const css = `
/* ===== Bottom navigation bar ===== */
.bbar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: stretch;
  gap: 2px;
  padding: 8px max(10px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left));
  background: rgba(8, 8, 10, 0.94);
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
}

.bbar-tab {
  flex: 1 1 0; min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 2px 4px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.18s, background 0.18s;
  position: relative;
  user-select: none;
}
.bbar-tab:active { background: rgba(255,255,255,0.06); }
.bbar-tab.active { color: #FAFAFA; }
.bbar-tab.warn   { color: #fbbf24; }
.bbar-tab.miss   { color: #ff8a8a; }

/* Active indicator line at top */
.bbar-tab.active::before {
  content: '';
  position: absolute;
  top: 0; left: 25%; right: 25%;
  height: 2px;
  border-radius: 0 0 2px 2px;
  background: #FAFAFA;
}
.bbar-tab.warn.active::before  { background: #fbbf24; }
.bbar-tab.miss.active::before  { background: #ff8a8a; }

.bbar-icon {
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.bbar-icon svg {
  width: 22px; height: 22px; display: block;
  fill: none; stroke: currentColor;
  stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round;
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bbar-tab.active .bbar-icon svg { transform: scale(1.12); }

.bbar-label {
  font-size: 9.5px; font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  line-height: 1;
}

/* Progress badge in top-right of icon */
.bbar-badge {
  position: absolute;
  top: -3px; right: -4px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 8px; font-weight: 800;
  font-variant-numeric: tabular-nums;
  background: rgba(255,255,255,0.12);
  color: inherit;
  border-radius: 99px;
  padding: 1px 4px;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
  min-width: 18px;
  text-align: center;
}
.bbar-tab.warn .bbar-badge { background: rgba(251,191,36,0.20); }
.bbar-tab.miss .bbar-badge {
  background: rgba(255,138,138,0.20);
  animation: bbar-miss-pulse 1.6s ease-in-out infinite;
}
@keyframes bbar-miss-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ===== Water tab: link + quick-add button ===== */
.bbar-water-wrap {
  flex: 1 1 0; min-width: 0;
  position: relative;
  display: flex;
}
.bbar-water-wrap .bbar-tab { flex: 1; }

.bbar-water-add {
  position: absolute;
  top: 4px; right: 2px;
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(125, 211, 252, 0.40);
  background: rgba(125, 211, 252, 0.12);
  color: #7DD3FC;
  font-family: inherit; font-size: 14px; font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, transform 0.10s;
  z-index: 1;
}
.bbar-water-add:active { transform: scale(0.85); }
.bbar-water-add.flash  { background: rgba(125, 211, 252, 0.45); }

/* ===== Global mobile styles (injected once, apply everywhere) ===== */
html, body { -webkit-text-size-adjust: 100%; }

@media (max-width: 768px) {
  html { touch-action: pan-y; }
  ::-webkit-scrollbar { width: 0; height: 0; display: none; }
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
}

.modal-bg, .modal, .po-modal-bg, .po-modal, .wt-overlay, .wt-viewer {
  overscroll-behavior: contain;
}
body.topbar-modal-open {
  overflow: hidden;
  touch-action: none;
}

/* Full-screen modals on small phones */
@media (max-width: 480px) {
  .modal-bg, .po-modal-bg {
    padding: 0 !important;
    align-items: stretch !important;
    justify-content: stretch !important;
  }
  .modal, .po-modal {
    width: 100% !important;
    max-width: 100% !important;
    max-height: 100vh !important;
    height: 100vh !important;
    border-radius: 0 !important;
    padding-top: max(20px, env(safe-area-inset-top)) !important;
    padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
    overflow-y: auto !important;
    overscroll-behavior: contain;
  }
}
`;

  // SVG icons — 24px viewBox, stroke-based
  const ICONS = {
    goals:   `<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>`,
    stack:   `<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="6" rx="3"/></svg>`,
    water:   `<svg viewBox="0 0 24 24"><path d="M12 3C9 8 6 12 6 15a6 6 0 0 0 12 0c0-3-3-7-6-12z"/></svg>`,
    gym:     `<svg viewBox="0 0 24 24"><line x1="6" y1="12" x2="18" y2="12"/><rect x="2" y="9.5" width="3.5" height="5" rx="1.2"/><rect x="18.5" y="9.5" width="3.5" height="5" rx="1.2"/><rect x="5" y="10.5" width="2" height="3" rx="1"/><rect x="17" y="10.5" width="2" height="3" rx="1"/></svg>`,
    finance: `<svg viewBox="0 0 24 24"><polyline points="3 18 8 11 13 15 19 7"/><polyline points="17 7 21 7 21 11"/></svg>`,
  };

  // -------- HTML --------
  const html = `
<nav class="bbar" id="bbar" role="navigation" aria-label="Main navigation">
  <a href="index.html" class="bbar-tab" id="bbarGoals">
    <div class="bbar-icon">${ICONS.goals}<span class="bbar-badge" id="bbarGoalsBadge" hidden></span></div>
    <span class="bbar-label">Goals</span>
  </a>
  <a href="health.html" class="bbar-tab" id="bbarStack">
    <div class="bbar-icon">${ICONS.stack}<span class="bbar-badge" id="bbarStackBadge" hidden></span></div>
    <span class="bbar-label">Stack</span>
  </a>
  <div class="bbar-water-wrap">
    <a href="po-water.html" class="bbar-tab" id="bbarWater">
      <div class="bbar-icon">${ICONS.water}<span class="bbar-badge" id="bbarWaterBadge" hidden></span></div>
      <span class="bbar-label">Water</span>
    </a>
    <button class="bbar-water-add" id="bbarWaterAdd" type="button" aria-label="Log one drink">+</button>
  </div>
  <a href="gym.html" class="bbar-tab" id="bbarGym">
    <div class="bbar-icon">${ICONS.gym}</div>
    <span class="bbar-label">Gym</span>
  </a>
  <a href="finance.html" class="bbar-tab" id="bbarFinance">
    <div class="bbar-icon">${ICONS.finance}</div>
    <span class="bbar-label">Finance</span>
  </a>
</nav>`;

  // -------- Inject --------
  function inject() {
    if (document.getElementById('bbar')) return;
    const style = document.createElement('style');
    style.id = 'topbar-style';
    style.textContent = css;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    document.body.appendChild(wrap.firstChild);
  }

  // -------- Active page --------
  function activePage() {
    const p = (window.location.pathname.split('/').pop() || '').toLowerCase();
    if (!p || p === 'index.html') return 'goals';
    if (p === 'health.html')    return 'stack';
    if (p === 'po-water.html') return 'water';
    if (p === 'gym.html')      return 'gym';
    if (p === 'finance.html')  return 'finance';
    return '';
  }

  function markActive() {
    const active = activePage();
    const map = { goals:'bbarGoals', stack:'bbarStack', water:'bbarWater', gym:'bbarGym', finance:'bbarFinance' };
    Object.values(map).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    if (map[active]) {
      const el = document.getElementById(map[active]);
      if (el) el.classList.add('active');
    }
  }

  // -------- Date helpers --------
  function activeDateKey() {
    const now = new Date(), d = new Date(now);
    if (now.getHours() < 6) d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function calendarDateKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  // -------- Progress readers --------
  function goalsProgress() {
    let g = [];
    try { g = JSON.parse(localStorage.getItem('goals:' + activeDateKey())) || []; } catch (e) {}
    const total = Array.isArray(g) ? g.length : 0;
    const done  = total ? g.filter(x => x && x.done).length : 0;
    return { done, total };
  }

  function stackProgress() {
    let items = [], taken = {};
    try { items = JSON.parse(localStorage.getItem('stack:items')) || []; } catch (e) {}
    try { taken = JSON.parse(localStorage.getItem('stack:taken:' + activeDateKey())) || {}; } catch (e) {}
    const total = Array.isArray(items) ? items.length : 0;
    const done  = total ? items.filter(i => i && taken[i.id]).length : 0;
    return { done, total };
  }

  function waterProgress() {
    let state = null;
    try { state = JSON.parse(localStorage.getItem('po_water_v1')); } catch (e) {}
    if (!state) return { done: 0, total: 0 };
    const done = (state.logs || {})[calendarDateKey()] || 0;
    const p    = state.profile || { weightKg: 75 };
    const wKg  = state.weightUnit === 'lb' ? (p.weightKg || 0) / 2.20462 : (p.weightKg || 0);
    const base = wKg * 35;
    const exercise = (p.activityHrsPerWeek || 0) / 7 * 500;
    const caffeine = Math.max(0, (state.caffeineMgPerDay || 0) - 200) * 1.5;
    const subs = (state.substances || []).reduce((s, x) => {
      const dose = (x && x.dose != null ? x.dose : (x && x.defaultDose)) || 0;
      return s + Math.max(0, dose * ((x && x.mlPerUnit) || 0));
    }, 0);
    let adjust = 0;
    if (p.sex === 'm') adjust += 200;
    if ((p.age || 0) >= 50) adjust += 100;
    const totalMl = base + exercise + caffeine + subs + adjust;
    let unitVol = state.bottleMl || 500;
    if (state.unit === 'glass') unitVol = state.glassMl || 250;
    else if (state.unit === 'oz') unitVol = 30;
    else if (state.unit === 'ml') unitVol = 1;
    const total = Math.max(1, Math.ceil(totalMl / unitVol));
    return { done, total };
  }

  function classify(done, total) {
    if (total === 0) return '';
    if (done >= total) return '';
    if (new Date().getHours() >= 18 && done < total * 0.5) return 'miss';
    return 'warn';
  }

  function render() {
    if (!document.getElementById('bbar')) return;

    const g = goalsProgress();
    const s = stackProgress();
    const w = waterProgress();

    function applyTab(tabId, badgeId, done, total) {
      const tab   = document.getElementById(tabId);
      const badge = document.getElementById(badgeId);
      if (!tab) return;
      const status = classify(done, total);
      tab.classList.remove('warn', 'miss');
      if (status) tab.classList.add(status);
      if (badge) {
        if (total > 0) {
          badge.textContent = done + '/' + total;
          badge.hidden = false;
        } else {
          badge.hidden = true;
        }
      }
    }

    applyTab('bbarGoals', 'bbarGoalsBadge', g.done, g.total);
    applyTab('bbarStack', 'bbarStackBadge', s.done, s.total);
    applyTab('bbarWater', 'bbarWaterBadge', w.done, w.total);
  }

  // -------- Water +1 --------
  function defaultWaterState() {
    return {
      unit: 'bottle', bottleMl: 500, glassMl: 250, weightUnit: 'kg',
      profile: { weightKg: 75, age: 25, sex: 'm', activityHrsPerWeek: 5 },
      caffeineMgPerDay: 200, substances: [], logs: {}
    };
  }

  async function pushWaterToSupabase(localWater) {
    if (window.location.pathname.endsWith('health.html')) return;
    if (!window.supabase || !TOPBAR_SUPABASE_URL || !TOPBAR_SUPABASE_KEY) return;
    if (TOPBAR_SUPABASE_URL.indexOf('PASTE-') === 0) return;
    try {
      const supa = window.supabase.createClient(TOPBAR_SUPABASE_URL, TOPBAR_SUPABASE_KEY);
      const { data } = await supa.from('app_state').select('data').eq('key', 'health').maybeSingle();
      const current = (data && data.data) || {};
      const merged  = Object.assign({}, current, { po_water_v1: localWater });
      await supa.from('app_state').upsert(
        { key: 'health', data: merged, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (e) {}
  }

  function addWater() {
    let state = null;
    try { state = JSON.parse(localStorage.getItem('po_water_v1')); } catch (e) {}
    if (!state || typeof state !== 'object') state = defaultWaterState();
    state.logs = state.logs || {};
    const k = calendarDateKey();
    state.logs[k] = (state.logs[k] || 0) + 1;
    try { localStorage.setItem('po_water_v1', JSON.stringify(state)); } catch (e) {}
    render();
    const btn = document.getElementById('bbarWaterAdd');
    if (btn) {
      btn.classList.add('flash');
      setTimeout(() => btn.classList.remove('flash'), 220);
    }
    pushWaterToSupabase(state);
  }

  // -------- Gesture / zoom lock --------
  function lockGestures() {
    function block(e) { e.preventDefault(); }
    document.addEventListener('gesturestart',  block, { passive: false });
    document.addEventListener('gesturechange', block, { passive: false });
    document.addEventListener('gestureend',    block, { passive: false });
    let lastTouch = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
  }

  // -------- Modal scroll lock --------
  function startModalLock() {
    const SELECTORS = ['.modal-bg', '.po-modal-bg', '.wt-overlay', '.wt-viewer', '.wt-cam'];
    function anyOpen() {
      for (const sel of SELECTORS) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (el.classList.contains('show') || el.classList.contains('is-open')) return true;
        }
      }
      return false;
    }
    function sync() { document.body.classList.toggle('topbar-modal-open', anyOpen()); }
    new MutationObserver(sync).observe(document.body, {
      attributes: true, attributeFilter: ['class'], subtree: true
    });
    sync();
  }

  // -------- Boot --------
  function boot() {
    inject();
    markActive();
    render();
    lockGestures();
    startModalLock();

    const waterBtn = document.getElementById('bbarWaterAdd');
    if (waterBtn) {
      waterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        addWater();
      });
    }

    window.addEventListener('storage', render);
    window.addEventListener('focus', render);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
    window.addEventListener('goals-changed', render);
    setInterval(render, 30 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
