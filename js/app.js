/**
 * Bumbershoot 2026 — My Schedule.
 *
 * Everything lives on the device: up to five named people, each with their own
 * { [entryId]: 'have' | 'want' } map in localStorage. The only way data moves
 * between devices is a share link the user creates deliberately — nothing is
 * ever sent anywhere on its own.
 */

const PROFILES_KEY = "bumbershoot2026-profiles";
const PICKS_PREFIX = "bumbershoot2026-picks";
const MAX_PEOPLE = 5;

/** Festival dates, used only to decide which day (if either) is "today". */
const DAY_DATES = { Sat: "2026-09-05", Sun: "2026-09-06" };

/** How far back from now the list anchors, so the set you're in stays on screen. */
const ANCHOR_LOOKBACK = 15;

const TIER_CYCLE = { null: "have", have: "want", want: null };

// ---------------------------------------------------------------- persistence

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`Could not read ${key}:`, err);
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    // Private browsing, blocked storage, full quota — the app still works for
    // this session, it just won't remember.
    console.warn(`Could not save ${key}:`, err);
    return false;
  }
}

function personKey(name) {
  return `${PICKS_PREFIX}:${slugify(name)}`;
}

/** Keep only ids and tiers we recognise — guards stale or hand-edited storage. */
function sanitizePicks(raw) {
  if (!raw || typeof raw !== "object") return {};
  const valid = new Set(SCHEDULE.map((e) => e.id));
  const picks = {};
  for (const [id, tier] of Object.entries(raw)) {
    if (valid.has(id) && (tier === "have" || tier === "want")) picks[id] = tier;
  }
  return picks;
}

function loadPicksFor(name) {
  return sanitizePicks(readJson(personKey(name), {}));
}

function savePicksFor(name, value) {
  writeJson(personKey(name), value);
}

/** { names: [], active: string|null }, with the pre-profiles save migrated in. */
function loadProfiles() {
  const stored = readJson(PROFILES_KEY, null);
  if (stored && Array.isArray(stored.names)) {
    const names = stored.names.filter((n) => typeof n === "string" && n.trim()).slice(0, MAX_PEOPLE);
    const active = names.includes(stored.active) ? stored.active : names[0] || null;
    return { names, active };
  }
  // Migration: picks saved before this app knew about people become "Me".
  const legacy = sanitizePicks(readJson(PICKS_PREFIX, null));
  if (Object.keys(legacy).length) {
    savePicksFor("Me", legacy);
    const profiles = { names: ["Me"], active: "Me" };
    writeJson(PROFILES_KEY, profiles);
    return profiles;
  }
  return { names: [], active: null };
}

function saveProfiles() {
  writeJson(PROFILES_KEY, profiles);
}

// ---------------------------------------------------------------------- state

let profiles = loadProfiles();
let picks = profiles.active ? loadPicksFor(profiles.active) : {};
let currentDay = "Sat";
let query = "";
let category = "All";
let tierFilter = "all";
let stageFilter = "All";

/** How far ahead the "up next" nudge looks, in minutes. */
const UPCOMING_WINDOW = 20;
/** Set from ?now=Sat@18:30 for testing outside the festival weekend. */
let clockOverride = null;
/** Decoded incoming share link, held until the user says what to do with it. */
let pendingImport = null;

// ------------------------------------------------------------------ the clock

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

// ------------------------------------------------------------------ filtering

function normalize(text) {
  return text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function matchesFilter(entry, tier) {
  if (category !== "All" && entry.category !== category) return false;
  if (stageFilter !== "All" && entry.stage !== stageFilter) return false;
  if (tierFilter === "have" && tier !== "have") return false;
  if (tierFilter === "picked" && !tier) return false;
  if (!query) return true;
  const needle = normalize(query);
  return normalize(entry.name).includes(needle) || normalize(entry.stage).includes(needle);
}

const filtering = () =>
  query !== "" || category !== "All" || stageFilter !== "All" || tierFilter !== "all";

// ------------------------------------------------------------------ rendering

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** Wrap the matched part of a search hit so it reads as a hit. */
function highlight(text) {
  if (!query) return escapeHtml(text);
  const start = normalize(text).indexOf(normalize(query));
  if (start < 0) return escapeHtml(text);
  const end = start + query.length;
  return `${escapeHtml(text.slice(0, start))}<mark>${escapeHtml(text.slice(start, end))}</mark>${escapeHtml(text.slice(end))}`;
}

function rowHtml(item, { conflicts, tight, nowMin }) {
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

  const walk = tight?.get(entry.id);
  const walkNote = walk
    ? `<span class="tight-flag">${walk.minutes === 0 ? "No gap" : `${walk.minutes} min`} after ${escapeHtml(
        walk.from.name
      )} — different stage</span>`
    : "";

  return `<button type="button" class="${classes.join(" ")}" data-id="${entry.id}"
      aria-pressed="${tier ? "true" : "false"}">
    <span class="time">${formatMin(displayStart)}<br>${formatMin(displayEnd)}</span>
    <span class="info">
      <span class="name-line"><span class="name">${highlight(entry.name)}</span></span>
      <span class="stage">(${highlight(entry.stage)})</span>
      ${sub}
      <span class="meta-row">
        <span class="cat-tag">${escapeHtml(entry.category)}</span>
        ${entry.isFlexible && !slotted ? '<span class="cat-tag flex-tag">Drop in</span>' : ""}
        <span class="live-flag"><span class="dot"></span>ON NOW</span>
        <span class="conflict-flag"><span class="dot"></span>Overlaps another pick</span>
        ${walkNote}
      </span>
    </span>
  </button>`;
}

function nowLineHtml() {
  return `<div class="now-line" id="now-line"><span class="now-label">Now</span></div>`;
}

function render({ preserveScroll = false } = {}) {
  const list = document.getElementById("list");
  const previousScroll = list.scrollTop;

  const nowMin = nowForDay(currentDay);
  const entries = SCHEDULE.filter((e) => e.day === currentDay);

  // Plan against the whole day: filtering is a view, so hiding rows must never
  // change which gaps are open or which picks clash.
  const { timeline, parked, conflicts, tight } = planDay(entries, picks, nowMin);
  const shownTimeline = timeline.filter((it) => matchesFilter(it.entry, it.tier));
  const shownParked = parked.filter((it) => matchesFilter(it.entry, it.tier));

  const anchor = nowMin == null || filtering() ? null : nowMin - ANCHOR_LOOKBACK;
  let html = "";
  let placedNowLine = anchor == null;

  for (const item of shownTimeline) {
    if (!placedNowLine && item.displayStart >= anchor) {
      html += nowLineHtml();
      placedNowLine = true;
    }
    html += rowHtml(item, { conflicts, tight, nowMin });
  }
  // Everything today has already started — the anchor sits at the end of the day.
  if (!placedNowLine) html += nowLineHtml();

  if (shownParked.length) {
    html += `<div class="section-head">
      <div class="section-title">Flexible — fit in when you can</div>
      <div class="section-note">Drop-in anytime. Picked ones move into the timeline when a gap opens up.</div>
    </div>`;
    for (const item of shownParked) {
      html += rowHtml(
        { ...item, displayStart: item.entry.startMin, displayEnd: item.entry.endMin, slotted: false },
        { conflicts, tight, nowMin: null }
      );
    }
  }

  if (!shownTimeline.length && !shownParked.length) {
    html = `<div class="empty">Nothing here matching that.${
      filtering() ? ' <button type="button" class="link-btn" id="clear-filters">Clear filters</button>' : ""
    }</div>`;
  }

  list.innerHTML = html;
  if (preserveScroll) list.scrollTop = previousScroll;

  updateCounts(timeline, parked, conflicts, shownTimeline.length + shownParked.length, entries.length);
  updateUpNext(timeline, nowMin);
  updateDayButtons();
  updateJumpButton();
}

function updateCounts(timeline, parked, conflicts, shown, total) {
  const all = timeline.concat(parked);
  const have = all.filter((it) => it.tier === "have").length;
  const want = all.filter((it) => it.tier === "want").length;
  const clash = conflicts.size ? ` · ${conflicts.size} clashing` : "";
  const picked = have || want ? `${have} have · ${want} want${clash}` : "";
  document.getElementById("counts").textContent = filtering() ? `${shown} of ${total} shown` : picked;
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

/**
 * The on-page nudge: something you picked is about to start.
 *
 * The case worth catching is the awkward one — a set you picked begins while
 * another pick is still playing — so the bar says what you'd be walking out of.
 */
function updateUpNext(timeline, nowMin) {
  const bar = document.getElementById("upnext");
  if (nowMin == null) {
    bar.hidden = true;
    return;
  }

  const picked = timeline.filter((it) => it.tier);
  const next = picked
    .filter((it) => it.displayStart > nowMin && it.displayStart - nowMin <= UPCOMING_WINDOW)
    .sort((a, b) => a.displayStart - b.displayStart)[0];

  if (!next) {
    bar.hidden = true;
    return;
  }

  const away = next.displayStart - nowMin;
  const clash = picked.find(
    (it) => it !== next && it.displayStart <= nowMin && it.displayEnd > next.displayStart
  );

  bar.hidden = false;
  bar.className = `upnext${clash ? " upnext-clash" : ""}`;
  bar.innerHTML = `
    <button type="button" class="upnext-body" data-goto="${next.entry.id}">
      <span class="upnext-lead">${next.tier === "have" ? "Have to see" : "Want to see"} · in ${away} min</span>
      <span class="upnext-name">${escapeHtml(next.entry.name)}</span>
      <span class="upnext-where">${formatMin(next.displayStart)} · ${escapeHtml(next.entry.stage)}</span>
      ${
        clash
          ? `<span class="upnext-warn">You'll be mid-set at ${escapeHtml(clash.entry.name)}, on until ${formatMin(
              clash.displayEnd
            )}</span>`
          : ""
      }
    </button>`;
}

/** Every stage in the lineup, for the stage filter. */
function populateStages() {
  const stages = [...new Set(SCHEDULE.map((e) => e.stage))].sort((a, b) => a.localeCompare(b));
  const select = document.getElementById("stage-filter");
  select.innerHTML =
    '<option value="All">All stages</option>' +
    stages.map((st) => `<option value="${escapeHtml(st)}">${escapeHtml(st)}</option>`).join("");
}

/** Bring a row into view and flash it, from the up-next bar. */
function scrollToEntry(id) {
  const row = document.querySelector(`.row[data-id="${CSS.escape(id)}"]`);
  const list = document.getElementById("list");
  if (!row) return;
  const offset = row.getBoundingClientRect().top - list.getBoundingClientRect().top;
  list.scrollTo({ top: list.scrollTop + offset - list.clientHeight * 0.25, behavior: "smooth" });
  row.classList.add("flash");
  setTimeout(() => row.classList.remove("flash"), 1200);
}

function updateWho() {
  document.getElementById("who-name").textContent = profiles.active || "Choose name";
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
}

// ------------------------------------------------------------------ the sheet

function openSheet(title, bodyHtml) {
  const sheet = document.getElementById("sheet");
  sheet.innerHTML = `<div class="sheet-title" id="sheet-title">${escapeHtml(title)}</div>${bodyHtml}`;
  sheet.hidden = false;
  document.getElementById("sheet-backdrop").hidden = false;
  const focusable = sheet.querySelector("input, button");
  if (focusable) focusable.focus();
}

function closeSheet() {
  document.getElementById("sheet").hidden = true;
  document.getElementById("sheet-backdrop").hidden = true;
}

/** First run, and any time nobody is selected. */
function openChooser() {
  const list = profiles.names
    .map((n) => `<button type="button" class="sheet-row" data-pick="${escapeHtml(n)}">${escapeHtml(n)}</button>`)
    .join("");
  const full = profiles.names.length >= MAX_PEOPLE;
  openSheet(
    profiles.names.length ? "Who's planning?" : "Welcome — who are you?",
    `${list}
     ${
       full
         ? `<div class="sheet-note">That's ${MAX_PEOPLE} people, the most this holds. Remove someone to add another.</div>`
         : `<form class="sheet-form" id="new-person">
              <input type="text" id="new-name" placeholder="Your name" maxlength="20" autocomplete="off" aria-label="Your name">
              <button type="submit" class="sheet-go">Start</button>
            </form>`
     }
     <div class="sheet-note">Saved on this device only. Use <strong>Share my picks</strong> to move a plan to your phone.</div>`
  );
}

function openMenu() {
  const others = profiles.names.filter((n) => n !== profiles.active);
  openSheet(
    profiles.active || "Choose name",
    `${others.map((n) => `<button type="button" class="sheet-row" data-pick="${escapeHtml(n)}">Switch to ${escapeHtml(n)}</button>`).join("")}
     ${profiles.names.length < MAX_PEOPLE ? '<button type="button" class="sheet-row" data-action="add">Add someone new</button>' : ""}
     <button type="button" class="sheet-row" data-action="share">Share my picks…</button>
     <button type="button" class="sheet-row danger" data-action="clear">Clear my picks</button>
     ${profiles.names.length > 1 ? '<button type="button" class="sheet-row danger" data-action="remove">Remove me from this device</button>' : ""}`
  );
}

function openShare() {
  const url = new URL(location.href);
  url.hash = `p=${encodePicks(SCHEDULE, picks)}&n=${encodeURIComponent(profiles.active || "A friend")}`;
  url.search = "";
  const link = url.toString();
  const count = Object.keys(picks).length;
  openSheet(
    "Share my picks",
    `<div class="sheet-note">${
      count
        ? `A link carrying all ${count} of your picks. Text or email it to yourself to pick up on another device, or send it to a friend.`
        : "You haven't picked anything yet — this link will be empty."
    }</div>
     <textarea class="share-box" id="share-box" readonly rows="3">${escapeHtml(link)}</textarea>
     <button type="button" class="sheet-go wide" data-action="copy">Copy link</button>`
  );
}

// ---------------------------------------------------------------- share links

function readIncomingShare() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const payload = hash.get("p");
  if (!payload) return null;
  try {
    const { picks: incoming, stale } = decodePicks(SCHEDULE, payload);
    return { picks: incoming, stale, name: (hash.get("n") || "A friend").slice(0, 20) };
  } catch (err) {
    console.warn("Ignoring unreadable share link:", err);
    return null;
  }
}

/**
 * Show what arrived and let the user decide. Nothing is written to storage
 * until they choose — opening a friend's link must never eat your own picks.
 */
function showImportBanner() {
  const banner = document.getElementById("import-banner");
  if (!pendingImport) {
    banner.hidden = true;
    return;
  }
  const count = Object.keys(pendingImport.picks).length;
  const full = profiles.names.length >= MAX_PEOPLE && !profiles.names.includes(pendingImport.name);
  banner.hidden = false;
  banner.innerHTML = `
    <div class="banner-text">
      <strong>${escapeHtml(pendingImport.name)}</strong> shared ${count} pick${count === 1 ? "" : "s"} with you.
      ${pendingImport.stale ? '<span class="banner-warn">This link was made from a different version of the lineup, so some sets may not line up.</span>' : ""}
      ${full ? `<span class="banner-warn">This device already holds ${MAX_PEOPLE} people — merge, or remove someone first.</span>` : ""}
    </div>
    <div class="banner-actions">
      ${full ? "" : `<button type="button" data-import="as">Open as ${escapeHtml(pendingImport.name)}</button>`}
      ${profiles.active ? '<button type="button" data-import="merge">Merge into mine</button>' : ""}
      <button type="button" class="ghost" data-import="dismiss">Dismiss</button>
    </div>`;
}

function applyImport(mode) {
  if (!pendingImport) return;
  if (mode === "as") {
    const name = pendingImport.name;
    if (profiles.names.includes(name) && !confirm(`Replace ${name}'s saved picks on this device?`)) return;
    if (!profiles.names.includes(name)) profiles.names.push(name);
    profiles.active = name;
    saveProfiles();
    picks = pendingImport.picks;
    savePicksFor(name, picks);
  } else if (mode === "merge") {
    picks = { ...picks, ...pendingImport.picks };
    savePicksFor(profiles.active, picks);
  }
  pendingImport = null;
  history.replaceState(null, "", location.pathname + location.search);
  showImportBanner();
  updateWho();
  render();
}

// ------------------------------------------------------------------- people

function selectPerson(name) {
  profiles.active = name;
  saveProfiles();
  picks = loadPicksFor(name);
  updateWho();
  closeSheet();
  render();
}

function addPerson(name) {
  const clean = name.trim().slice(0, 20);
  if (!clean) return;
  if (profiles.names.some((n) => n.toLowerCase() === clean.toLowerCase())) {
    selectPerson(profiles.names.find((n) => n.toLowerCase() === clean.toLowerCase()));
    return;
  }
  if (profiles.names.length >= MAX_PEOPLE) return;
  profiles.names.push(clean);
  selectPerson(clean);
}

// ---------------------------------------------------------------- interaction

function cycleTier(id) {
  if (!profiles.active) {
    openChooser();
    return;
  }
  const current = picks[id] || null;
  const next = TIER_CYCLE[current];
  if (next) picks[id] = next;
  else delete picks[id];
  savePicksFor(profiles.active, picks);
  // Picks change which gaps are open, so flexible items reflow on every tap.
  render({ preserveScroll: true });
}

function selectDay(day, { anchor = true } = {}) {
  currentDay = day;
  render();
  if (anchor && nowForDay(day) != null && !filtering()) anchorToNow();
  else document.getElementById("list").scrollTo({ top: 0, behavior: "instant" });
}

function setQuery(value) {
  query = value;
  document.getElementById("search-clear").hidden = !value;
  render();
  if (!filtering() && nowForDay(currentDay) != null) anchorToNow();
  else document.getElementById("list").scrollTo({ top: 0, behavior: "instant" });
}

function afterFilterChange() {
  render();
  if (!filtering() && nowForDay(currentDay) != null) anchorToNow();
  else document.getElementById("list").scrollTo({ top: 0, behavior: "instant" });
}

function setCategory(value) {
  category = value;
  document.querySelectorAll(".cat-btn").forEach((b) => b.classList.toggle("active", b.dataset.cat === value));
  afterFilterChange();
}

function setTier(value) {
  tierFilter = value;
  document.querySelectorAll(".tier-btn").forEach((b) => b.classList.toggle("active", b.dataset.tier === value));
  afterFilterChange();
}

function setStage(value) {
  stageFilter = value;
  document.getElementById("stage-filter").value = value;
  afterFilterChange();
}

function clearFilters() {
  document.getElementById("search").value = "";
  query = "";
  document.getElementById("search-clear").hidden = true;
  category = "All";
  tierFilter = "all";
  stageFilter = "All";
  document.querySelectorAll(".cat-btn").forEach((b) => b.classList.toggle("active", b.dataset.cat === "All"));
  document.querySelectorAll(".tier-btn").forEach((b) => b.classList.toggle("active", b.dataset.tier === "all"));
  document.getElementById("stage-filter").value = "All";
  afterFilterChange();
}

function handleSheetClick(event) {
  const row = event.target.closest("[data-pick], [data-action]");
  if (!row) return;
  if (row.dataset.pick) return selectPerson(row.dataset.pick);

  switch (row.dataset.action) {
    case "add":
      closeSheet();
      profiles.active = null;
      openChooser();
      break;
    case "share":
      openShare();
      break;
    case "copy": {
      const box = document.getElementById("share-box");
      box.select();
      navigator.clipboard?.writeText(box.value).catch(() => {});
      row.textContent = "Copied";
      setTimeout(() => (row.textContent = "Copy link"), 1500);
      break;
    }
    case "clear":
      if (!confirm(`Clear all of ${profiles.active}'s picks for both days?`)) return;
      picks = {};
      savePicksFor(profiles.active, picks);
      closeSheet();
      render();
      break;
    case "remove":
      if (!confirm(`Remove ${profiles.active} and their picks from this device?`)) return;
      try {
        localStorage.removeItem(personKey(profiles.active));
      } catch (err) {
        console.warn("Could not remove saved picks:", err);
      }
      profiles.names = profiles.names.filter((n) => n !== profiles.active);
      profiles.active = profiles.names[0] || null;
      saveProfiles();
      picks = profiles.active ? loadPicksFor(profiles.active) : {};
      updateWho();
      closeSheet();
      if (!profiles.active) openChooser();
      render();
      break;
  }
}

function init() {
  clockOverride = readClockOverride();
  pendingImport = readIncomingShare();

  const list = document.getElementById("list");
  list.addEventListener("click", (event) => {
    if (event.target.closest("#clear-filters")) {
      clearFilters();
      return;
    }
    const row = event.target.closest(".row");
    if (row) cycleTier(row.dataset.id);
  });
  list.addEventListener("scroll", updateJumpButton, { passive: true });

  document.querySelectorAll(".day-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectDay(btn.dataset.day));
  });
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => setCategory(btn.dataset.cat));
  });
  document.querySelectorAll(".tier-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTier(btn.dataset.tier));
  });
  const stageSelect = document.getElementById("stage-filter");
  stageSelect.addEventListener("change", () => setStage(stageSelect.value));
  document.getElementById("upnext").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-goto]");
    if (btn) scrollToEntry(btn.dataset.goto);
  });

  const search = document.getElementById("search");
  search.addEventListener("input", () => setQuery(search.value.trim()));
  document.getElementById("search-clear").addEventListener("click", () => {
    search.value = "";
    setQuery("");
    search.focus();
  });

  document.getElementById("jump-now").addEventListener("click", () => anchorToNow("smooth"));
  document.getElementById("who").addEventListener("click", () => (profiles.active ? openMenu() : openChooser()));
  document.getElementById("sheet").addEventListener("click", handleSheetClick);
  document.getElementById("sheet").addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id === "new-person") addPerson(document.getElementById("new-name").value);
  });
  document.getElementById("sheet-backdrop").addEventListener("click", () => {
    if (profiles.active) closeSheet();
  });
  document.getElementById("import-banner").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-import]");
    if (btn) applyImport(btn.dataset.import);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!document.getElementById("sheet").hidden && profiles.active) return closeSheet();
      if (query) {
        search.value = "";
        setQuery("");
      }
      return;
    }
    // "/" jumps to search, the way every list-shaped desktop app does it.
    if (event.key === "/" && document.activeElement !== search) {
      event.preventDefault();
      search.focus();
      search.select();
    }
  });

  // A share link opened while the app is already up only changes the hash, so
  // the page never reloads — pick it up here too.
  window.addEventListener("hashchange", () => {
    pendingImport = readIncomingShare();
    showImportBanner();
  });

  // Coming back to the tab mid-festival should land you back on "now".
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    render();
    if (nowForDay(currentDay) != null && !filtering()) anchorToNow();
  });

  // Keep "ended", "on now" and the divider honest without a page reload.
  setInterval(() => render({ preserveScroll: true }), 60000);

  populateStages();
  updateWho();
  showImportBanner();
  selectDay(todayDay() || "Sat");
  if (!profiles.active && !pendingImport) openChooser();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", init);
