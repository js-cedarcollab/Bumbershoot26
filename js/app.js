/**
 * Bumbershoot 2026 — My Schedule.
 *
 * State lives entirely on the device: a { [entryId]: 'have' | 'want' } map in
 * localStorage. No accounts, no backend, nothing leaves the phone.
 */

const STORAGE_KEY = "bumbershoot2026-picks";

/** Festival dates, used only to decide which day (if either) is "today". */
const DAY_DATES = { Sat: "2026-09-05", Sun: "2026-09-06" };

/** How far back from now the list anchors, so the set you're in stays on screen. */
const ANCHOR_LOOKBACK = 15;

const TIER_CYCLE = { null: "have", have: "want", want: null };

// ---------------------------------------------------------------- persistence

function loadPicks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    // Drop anything that isn't a known id or a valid tier — stale or hand-edited.
    const valid = new Set(SCHEDULE.map((e) => e.id));
    const picks = {};
    for (const [id, tier] of Object.entries(parsed)) {
      if (valid.has(id) && (tier === "have" || tier === "want")) picks[id] = tier;
    }
    return picks;
  } catch (err) {
    console.warn("Could not read saved picks:", err);
    return {};
  }
}

function savePicks(picks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
  } catch (err) {
    // Private browsing, full quota, storage blocked — the app still works for
    // this session, it just won't remember.
    console.warn("Could not save picks:", err);
  }
}

// ---------------------------------------------------------------------- state

let picks = loadPicks();
let currentDay = "Sat";
/** Set from ?now=Sat@18:30 for testing outside the festival weekend. */
let clockOverride = null;

/** Local date as YYYY-MM-DD, so "today" means the user's day, not UTC's. */
function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Which festival day is happening right now, or null outside the weekend. */
function todayDay() {
  if (clockOverride) return clockOverride.day;
  const key = localDateKey(new Date());
  return Object.keys(DAY_DATES).find((d) => DAY_DATES[d] === key) || null;
}

/** Current time in minutes since midnight. */
function nowMinutes() {
  if (clockOverride) return clockOverride.min;
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** Minutes to anchor the view to when viewing today, else null. */
function nowForDay(day) {
  return todayDay() === day ? nowMinutes() : null;
}

function readClockOverride() {
  const value = new URLSearchParams(location.search).get("now");
  if (!value) return null;
  const m = /^(Sat|Sun)@(\d{1,2}):(\d{2})$/i.exec(value.trim());
  if (!m) return null;
  const day = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
  return { day, min: Number(m[2]) * 60 + Number(m[3]) };
}

// ------------------------------------------------------------------ rendering

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function rowHtml(item, { conflicts, nowMin }) {
  const { entry, tier, displayStart, displayEnd, slotted } = item;
  const classes = ["row"];
  if (tier) classes.push(tier);
  if (conflicts.has(entry.id)) classes.push("conflict");
  if (nowMin != null && displayEnd <= nowMin) classes.push("ended");
  if (nowMin != null && displayStart <= nowMin && nowMin < displayEnd) classes.push("live");

  const realWindow = `${formatMin(entry.startMin)}–${formatMin(entry.endMin)}`;
  const sub = slotted
    ? `<span class="sub">(drop in anytime, actually runs ${escapeHtml(realWindow)})</span>`
    : "";

  return `<button type="button" class="${classes.join(" ")}" data-id="${entry.id}"
      aria-pressed="${tier ? "true" : "false"}">
    <span class="time">${formatMin(displayStart)}<br>${formatMin(displayEnd)}</span>
    <span class="info">
      <span class="name-line"><span class="name">${escapeHtml(entry.name)}</span></span>
      <span class="stage">(${escapeHtml(entry.stage)})</span>
      ${sub}
      <span class="meta-row">
        <span class="cat-tag">${escapeHtml(entry.category)}</span>
        ${entry.isFlexible && !slotted ? '<span class="cat-tag flex-tag">Drop in</span>' : ""}
        <span class="live-flag"><span class="dot"></span>ON NOW</span>
        <span class="conflict-flag"><span class="dot"></span>Overlaps another pick</span>
      </span>
    </span>
  </button>`;
}

function render({ preserveScroll = false } = {}) {
  const list = document.getElementById("list");
  const previousScroll = list.scrollTop;

  const nowMin = nowForDay(currentDay);
  const entries = SCHEDULE.filter((e) => e.day === currentDay);
  const { timeline, parked, conflicts } = planDay(entries, picks, nowMin);

  const anchor = nowMin == null ? null : nowMin - ANCHOR_LOOKBACK;
  let html = "";
  let placedNowLine = anchor == null;

  for (const item of timeline) {
    if (!placedNowLine && item.displayStart >= anchor) {
      html += nowLineHtml();
      placedNowLine = true;
    }
    html += rowHtml(item, { conflicts, nowMin });
  }
  // Everything today has already started — the anchor sits at the end of the day.
  if (!placedNowLine) html += nowLineHtml();

  if (parked.length) {
    html += `<div class="section-head">
      <div class="section-title">Flexible — fit in when you can</div>
      <div class="section-note">Drop-in anytime. Picked ones move into the timeline when a gap opens up.</div>
    </div>`;
    for (const item of parked) {
      html += rowHtml(
        { ...item, displayStart: item.entry.startMin, displayEnd: item.entry.endMin, slotted: false },
        { conflicts, nowMin: null }
      );
    }
  }

  list.innerHTML = html || '<div class="empty">Nothing scheduled.</div>';
  if (preserveScroll) list.scrollTop = previousScroll;

  updateCounts(timeline, parked, conflicts);
  updateDayButtons();
  updateJumpButton();
}

function nowLineHtml() {
  return `<div class="now-line" id="now-line"><span class="now-label">Now</span></div>`;
}

function updateCounts(timeline, parked, conflicts) {
  const all = timeline.concat(parked);
  const have = all.filter((it) => it.tier === "have").length;
  const want = all.filter((it) => it.tier === "want").length;
  const el = document.getElementById("counts");
  const clash = conflicts.size ? ` · ${conflicts.size} clashing` : "";
  el.textContent = have || want ? `${have} have · ${want} want${clash}` : "";
}

function updateDayButtons() {
  const today = todayDay();
  document.querySelectorAll(".day-btn").forEach((btn) => {
    const day = btn.dataset.day;
    btn.classList.toggle("active", day === currentDay);
    btn.setAttribute("aria-selected", day === currentDay ? "true" : "false");
    const pip = btn.querySelector(".today-pip");
    if (pip) pip.hidden = day !== today;
  });
}

// --------------------------------------------------------------- "now" anchor

function anchorToNow(behavior = "instant") {
  const line = document.getElementById("now-line");
  const list = document.getElementById("list");
  if (!line || nowForDay(currentDay) == null) {
    list.scrollTo({ top: 0, behavior });
    return;
  }
  // Leave the previous set or two visible above the line. Measured against the
  // scroll container rather than offsetTop, which resolves to the positioned body.
  const offset = line.getBoundingClientRect().top - list.getBoundingClientRect().top;
  const target = list.scrollTop + offset - list.clientHeight * 0.22;
  list.scrollTo({ top: Math.max(0, target), behavior });
}

function updateJumpButton() {
  const btn = document.getElementById("jump-now");
  const line = document.getElementById("now-line");
  const list = document.getElementById("list");
  if (!line || nowForDay(currentDay) == null) {
    btn.classList.remove("show");
    return;
  }
  const offset = line.getBoundingClientRect().top - list.getBoundingClientRect().top;
  const visible = offset > -40 && offset < list.clientHeight - 40;
  btn.classList.toggle("show", !visible);
  btn.textContent = "";
  btn.insertAdjacentHTML("beforeend", '<span class="dot"></span>Jump to now');
}

// ---------------------------------------------------------------- interaction

function cycleTier(id) {
  const current = picks[id] || null;
  const next = TIER_CYCLE[current];
  if (next) picks[id] = next;
  else delete picks[id];
  savePicks(picks);
  // Picks change which gaps are open, so flexible items reflow on every tap.
  render({ preserveScroll: true });
}

function selectDay(day, { anchor = true } = {}) {
  currentDay = day;
  render();
  if (anchor && nowForDay(day) != null) anchorToNow();
  else document.getElementById("list").scrollTo({ top: 0, behavior: "instant" });
}

function init() {
  clockOverride = readClockOverride();

  const list = document.getElementById("list");
  list.addEventListener("click", (event) => {
    const row = event.target.closest(".row");
    if (row) cycleTier(row.dataset.id);
  });
  list.addEventListener("scroll", updateJumpButton, { passive: true });

  document.querySelectorAll(".day-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectDay(btn.dataset.day));
  });

  document.getElementById("jump-now").addEventListener("click", () => anchorToNow("smooth"));

  document.getElementById("reset").addEventListener("click", () => {
    if (!Object.keys(picks).length) return;
    if (!confirm("Clear all your picks for both days?")) return;
    picks = {};
    savePicks(picks);
    render();
  });

  // Coming back to the tab mid-festival should land you back on "now".
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    render();
    if (nowForDay(currentDay) != null) anchorToNow();
  });

  // Keep "ended", "on now" and the divider honest without a page reload.
  setInterval(() => render({ preserveScroll: true }), 60000);

  selectDay(todayDay() || "Sat");

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", init);
