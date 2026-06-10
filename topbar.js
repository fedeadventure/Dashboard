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

/* ===== Theme transition helper ===== */
.theme-transitioning,
.theme-transitioning * {
  transition: background-color 0.25s ease, border-color 0.25s ease,
              color 0.25s ease, box-shadow 0.25s ease,
              stroke 0.25s ease, fill 0.25s ease !important;
}

/* ===== Theme toggle button ===== */
.bbar-theme-btn {
  position: fixed;
  bottom: calc(72px + max(8px, env(safe-area-inset-bottom)));
  right: max(14px, env(safe-area-inset-right));
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 8, 10, 0.80);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
  z-index: 99;
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  box-shadow: 0 2px 8px rgba(0,0,0,0.30);
  transition: background 0.18s, color 0.18s, transform 0.12s;
}
.bbar-theme-btn svg { width: 15px; height: 15px; display: block; flex-shrink: 0; }
.bbar-theme-btn:active { transform: scale(0.88); }
@keyframes bbar-spin {
  from { transform: rotate(-30deg) scale(0.80); opacity: 0.4; }
  to   { transform: rotate(0deg)   scale(1);    opacity: 1; }
}
.bbar-theme-btn.spinning { animation: bbar-spin 0.30s cubic-bezier(0.22,1,0.36,1); }

/* ===== Light mode: CSS custom-property overrides ===== */
html[data-theme="light"] {
  color-scheme: light;
  --bg: #F2F0EB;
  --bg-deep: #EAE8E3;
  --bg-card: rgba(255, 255, 255, 0.85);
  --bg-secondary: rgba(0, 0, 0, 0.03);
  --bg-input: rgba(255, 255, 255, 0.92);
  --bg-input-focus: #FFFFFF;
  --bg-dropdown: rgba(252, 251, 248, 0.99);
  --border: rgba(0, 0, 0, 0.08);
  --border-soft: rgba(0, 0, 0, 0.05);
  --border-strong: rgba(0, 0, 0, 0.14);
  --text-primary: #131110;
  --text-secondary: #4A4843;
  --text-tertiary: #7A7874;
  --text-quaternary: #AAA7A3;
  --text-1: #131110;
  --text-2: rgba(0, 0, 0, 0.62);
  --text-3: rgba(0, 0, 0, 0.40);
  --text-4: rgba(0, 0, 0, 0.24);
  --glass-bg: rgba(255, 255, 255, 0.80);
  --glass-border: rgba(0, 0, 0, 0.07);
  --glass-border-strong: rgba(0, 0, 0, 0.11);
  --glass-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
  --success: #1A8F60;
  --warning: #B87D0A;
  --danger: #CC2A2A;
  --good: #1A8F60;
  --bad: #CC2A2A;
  --info: #2090C0;
  --accent: #D4652B;
  --accent-glow: rgba(212, 101, 43, 0.22);
  --tag-stack: #8A6800;
  --tag-stack-bg: rgba(180, 140, 0, 0.12);
  --warning-bg: rgba(140, 40, 40, 0.07);
}

/* ===== Light mode: page backgrounds ===== */
html[data-theme="light"],
html[data-theme="light"] body {
  background: #F2F0EB;
}
html[data-theme="light"] body::before {
  background:
    radial-gradient(circle at 82% 12%, rgba(224, 118, 88, 0.08), transparent 44%),
    radial-gradient(circle at 18% 90%, rgba(140, 140, 180, 0.05), transparent 48%);
}
html[data-theme="light"] body::after {
  background-image: radial-gradient(rgba(0,0,0,0.025) 1px, transparent 1px);
}

/* ===== Light mode: bottom nav bar ===== */
html[data-theme="light"] .bbar {
  background: rgba(242, 240, 235, 0.96);
  border-top-color: rgba(0, 0, 0, 0.09);
}
html[data-theme="light"] .bbar-tab { color: rgba(0, 0, 0, 0.32); }
html[data-theme="light"] .bbar-tab:active { background: rgba(0,0,0,0.05); }
html[data-theme="light"] .bbar-tab.active { color: #131110; }
html[data-theme="light"] .bbar-tab.warn   { color: #B87D0A; }
html[data-theme="light"] .bbar-tab.miss   { color: #CC2A2A; }
html[data-theme="light"] .bbar-tab.active::before { background: #131110; }
html[data-theme="light"] .bbar-tab.warn.active::before { background: #B87D0A; }
html[data-theme="light"] .bbar-tab.miss.active::before { background: #CC2A2A; }
html[data-theme="light"] .bbar-badge { background: rgba(0,0,0,0.08); color: rgba(0,0,0,0.50); }
html[data-theme="light"] .bbar-tab.warn .bbar-badge { background: rgba(184,125,10,0.16); color: #B87D0A; }
html[data-theme="light"] .bbar-tab.miss .bbar-badge { background: rgba(204,42,42,0.16); color: #CC2A2A; }
html[data-theme="light"] .bbar-water-add {
  border-color: rgba(0, 100, 200, 0.32);
  background: rgba(0, 100, 200, 0.08);
  color: #0060A8;
}
html[data-theme="light"] .bbar-theme-btn {
  border-color: rgba(0, 0, 0, 0.12);
  background: rgba(242, 240, 235, 0.92);
  color: rgba(0, 0, 0, 0.48);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
html[data-theme="light"] .bbar-theme-btn:active { background: rgba(220, 218, 212, 0.96); }

/* ===== Light mode: finance internal section tabs ===== */
html[data-theme="light"] .bottom-tabs {
  background: rgba(242, 240, 235, 0.96);
  border-bottom-color: rgba(0, 0, 0, 0.09);
}
html[data-theme="light"] .bot-tab { color: var(--text-tertiary); }
html[data-theme="light"] .bot-tab:hover { background: rgba(0,0,0,0.04); color: var(--text-secondary); }
html[data-theme="light"] .bot-tab.active {
  background: rgba(0,0,0,0.06);
  border-color: rgba(0,0,0,0.10);
  color: var(--text-primary);
}

/* ===== Light mode: index.html (Goals) ===== */
html[data-theme="light"] .dash-title {
  background: linear-gradient(165deg, #1A1816 0%, #4A4843 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
html[data-theme="light"] .goal-ticker {
  background:
    linear-gradient(180deg, rgba(0,0,0,0.035) 0%, rgba(0,0,0,0.018) 100%),
    repeating-linear-gradient(0deg, rgba(0,0,0,0.01) 0, rgba(0,0,0,0.01) 1px, transparent 1px, transparent 3px);
  box-shadow: inset 0 1px 0 rgba(0,0,0,0.04), inset 0 -1px 0 rgba(0,0,0,0.04);
}
html[data-theme="light"] .goal-ticker-led-dot {
  background: #1A8F60;
  box-shadow: 0 0 8px rgba(26,143,96,0.55);
}
html[data-theme="light"] .goal-ticker-label { color: var(--text-tertiary); }
html[data-theme="light"] .goal-ticker-row   { color: var(--text-primary); }
html[data-theme="light"] .day-ring-wrap {
  background: rgba(255,255,255,0.84);
  box-shadow: 0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.06);
}
html[data-theme="light"] .day-ring-track { stroke: rgba(0,0,0,0.07); }
html[data-theme="light"] .day-ring-percent { color: var(--text-primary); }
html[data-theme="light"] .day-ring-phase   { color: var(--text-tertiary); }
html[data-theme="light"] .section-title    { color: var(--text-tertiary); }
html[data-theme="light"] .section-title::before { background: var(--text-quaternary); }
html[data-theme="light"] .section-title::after  {
  background: linear-gradient(90deg, rgba(0,0,0,0.08), transparent);
}
html[data-theme="light"] .gm-card {
  background: rgba(255,255,255,0.84);
  box-shadow: 0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.06);
}
html[data-theme="light"] .gm-card.gm-all-done::before {
  background: radial-gradient(circle at 50% 0%, rgba(26,143,96,0.07), transparent 60%);
}
html[data-theme="light"] .gm-streak {
  background: rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.08);
  color: var(--text-tertiary);
}
html[data-theme="light"] .gm-streak.gm-streak-active {
  background: rgba(184,125,10,0.10);
  border-color: rgba(184,125,10,0.28);
  color: #B87D0A;
}
html[data-theme="light"] .gm-bar-seg      { background: rgba(0,0,0,0.07); }
html[data-theme="light"] .gm-bar-seg-done { background: var(--success); box-shadow: 0 0 5px rgba(26,143,96,0.35); }
html[data-theme="light"] .gm-row {
  background: rgba(0,0,0,0.028);
  border-color: rgba(0,0,0,0.07);
}
html[data-theme="light"] .gm-row:hover { background: rgba(0,0,0,0.048); }
html[data-theme="light"] .gm-row.gm-row-done    { background: rgba(26,143,96,0.05); opacity: 0.60; }
html[data-theme="light"] .gm-row.gm-row-queued  { background: rgba(184,125,10,0.07); box-shadow: inset 3px 0 0 0 #B87D0A; }
html[data-theme="light"] .gm-text  { color: var(--text-primary); }
html[data-theme="light"] .gm-check { background: rgba(255,255,255,0.92); border-color: rgba(0,0,0,0.20); }
html[data-theme="light"] .gm-check:checked { background: var(--success); border-color: var(--success); }
html[data-theme="light"] .gm-input {
  background: rgba(255,255,255,0.92);
  border-color: rgba(0,0,0,0.12);
  color: var(--text-primary);
}
html[data-theme="light"] .gm-input:focus { background: #FFFFFF; border-color: rgba(0,0,0,0.28); }
html[data-theme="light"] .gm-input::placeholder { color: var(--text-quaternary); }
html[data-theme="light"] .gm-add {
  background: linear-gradient(180deg, #1A1816 0%, #2E2B28 100%);
  color: #FFFFFF;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.20);
}
html[data-theme="light"] .gm-polish {
  background: rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.12);
  color: var(--text-primary);
}
html[data-theme="light"] .gm-show-toggle,
html[data-theme="light"] .gm-push-btn { border-color: rgba(0,0,0,0.14); color: var(--text-tertiary); }
html[data-theme="light"] .empty-state { color: var(--text-tertiary); }

/* ===== Light mode: health.html (Daily Stack) ===== */
html[data-theme="light"] .stack-ticker { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.06); }
html[data-theme="light"] .stack-item { background: rgba(0,0,0,0.025); }
html[data-theme="light"] .stack-item:hover { background: rgba(0,0,0,0.042); }
html[data-theme="light"] .stack-item.taken { background: rgba(26,143,96,0.07); }
html[data-theme="light"] .stack-check { background: rgba(255,255,255,0.92); border-color: rgba(0,0,0,0.20); }
html[data-theme="light"] .stack-check.checked { background: #1A8F60; border-color: #1A8F60; }
html[data-theme="light"] .stack-item-del { border-color: rgba(0,0,0,0.12); color: var(--text-tertiary); }
html[data-theme="light"] .stack-item-del:hover {
  color: #CC2A2A;
  border-color: rgba(204,42,42,0.35);
  background: rgba(204,42,42,0.06);
}
html[data-theme="light"] .stack-add-btn {
  background: linear-gradient(180deg, #1A1816 0%, #2E2B28 100%);
  color: #FFFFFF; border-color: #1A1816;
}
html[data-theme="light"] .stack-search-results {
  background: rgba(252,251,248,0.99);
  border-color: rgba(0,0,0,0.12);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

/* ===== Light mode: gym.html ===== */
html[data-theme="light"] .po-ex-select {
  background: rgba(255,255,255,0.92);
  border-color: rgba(0,0,0,0.12);
  color: var(--text-1);
}
html[data-theme="light"] .po-ex-select:focus {
  border-color: rgba(0,0,0,0.30);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
}
html[data-theme="light"] .po-btn-icon   { background: rgba(255,255,255,0.84); }
html[data-theme="light"] .po-modal-seg  { background: rgba(0,0,0,0.04); }
html[data-theme="light"] .po-seg-btn:hover { background: rgba(0,0,0,0.04); }
html[data-theme="light"] .po-seg-control  { background: rgba(0,0,0,0.04); }
html[data-theme="light"] .po-modal-bg     { background: rgba(0,0,0,0.36); }

/* ===== Light mode: po-water.html ===== */
html[data-theme="light"] .water-bar-track { background: rgba(0,0,0,0.07); }
html[data-theme="light"] .water-minus-btn { background: rgba(0,0,0,0.05); }
`;

  // SVG icons — 24px viewBox, stroke-based
  const ICONS = {
    goals:   `<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>`,
    stack:   `<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="6" rx="3"/></svg>`,
    water:   `<svg viewBox="0 0 24 24"><path d="M12 3C9 8 6 12 6 15a6 6 0 0 0 12 0c0-3-3-7-6-12z"/></svg>`,
    gym:     `<svg viewBox="0 0 24 24"><line x1="6" y1="12" x2="18" y2="12"/><rect x="2" y="9.5" width="3.5" height="5" rx="1.2"/><rect x="18.5" y="9.5" width="3.5" height="5" rx="1.2"/><rect x="5" y="10.5" width="2" height="3" rx="1"/><rect x="17" y="10.5" width="2" height="3" rx="1"/></svg>`,
    finance: `<svg viewBox="0 0 24 24"><polyline points="3 18 8 11 13 15 19 7"/><polyline points="17 7 21 7 21 11"/></svg>`,
    moon:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    sun:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
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
</nav>
<button class="bbar-theme-btn" id="bbarThemeBtn" type="button" aria-label="Switch to light mode">
  <span class="theme-icon-moon">${ICONS.moon}</span>
  <span class="theme-icon-sun" style="display:none">${ICONS.sun}</span>
</button>`;

  // -------- Inject --------
  function inject() {
    if (document.getElementById('bbar')) return;
    const style = document.createElement('style');
    style.id = 'topbar-style';
    style.textContent = css;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    // html contains <nav> then <button> — append both children
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
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

  // -------- Theme --------
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme, animate) {
    if (animate) {
      document.documentElement.classList.add('theme-transitioning');
      setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 420);
    }
    // Persist original dark theme-color before first mutation
    const mTC = document.querySelector('meta[name="theme-color"]');
    if (mTC && !mTC.dataset.dark) mTC.dataset.dark = mTC.content;
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (mTC) mTC.content = '#F2F0EB';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (mTC) mTC.content = mTC.dataset.dark || mTC.content;
    }
    const mCS = document.querySelector('meta[name="color-scheme"]');
    if (mCS) mCS.content = theme === 'light' ? 'light' : 'dark';
  }

  function updateThemeBtn() {
    const btn = document.getElementById('bbarThemeBtn');
    if (!btn) return;
    const isDark = currentTheme() === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    const moonEl = btn.querySelector('.theme-icon-moon');
    const sunEl  = btn.querySelector('.theme-icon-sun');
    if (moonEl) moonEl.style.display = isDark ? '' : 'none';
    if (sunEl)  sunEl.style.display  = isDark ? 'none' : '';
  }

  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    try { localStorage.setItem('dash_theme', next); } catch (e) {}
    updateThemeBtn();
    const btn = document.getElementById('bbarThemeBtn');
    if (btn) {
      btn.classList.add('spinning');
      setTimeout(() => btn.classList.remove('spinning'), 340);
    }
  }

  // -------- Boot --------
  function boot() {
    inject();
    markActive();
    // Apply stored theme before first render (no animation)
    const stored = (function() { try { return localStorage.getItem('dash_theme'); } catch(e) { return null; } }());
    applyTheme(stored || 'dark', false);
    updateThemeBtn();
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

    const themeBtn = document.getElementById('bbarThemeBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

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
