/**
 * Pure scheduling logic: gap-finding for flexible items, conflict detection,
 * and the day plan the renderer draws. No DOM in here, so it can be unit-tested.
 */

/** Preferred length of a suggested drop-in slot, and the shortest we'll accept. */
const PREFERRED_SLOT = 30;
const MIN_SLOT = 20;

/** Do [aStart,aEnd) and [bStart,bEnd) overlap? */
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/** Merge a list of [start,end) intervals into sorted, non-overlapping ones. */
function mergeBusy(intervals) {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [s, e] of sorted) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  return merged;
}

/**
 * First open span of `length` minutes inside [windowStart, windowEnd) that
 * doesn't collide with `busy`. Returns the start minute, or null if the window
 * has no room left.
 */
function firstFreeSlot(windowStart, windowEnd, length, busy) {
  if (windowEnd - windowStart < length) return null;
  const merged = mergeBusy(busy);
  let cursor = windowStart;
  while (cursor + length <= windowEnd) {
    const blocker = merged.find((b) => overlaps(cursor, cursor + length, b[0], b[1]));
    if (!blocker) return cursor;
    cursor = blocker[1];
  }
  return null;
}

/**
 * Suggest a slot for one flexible pick.
 *
 * Tries, in order: a full-length slot no earlier than `notBefore` (so we don't
 * suggest a drop-in that already passed), the same at any point in the window,
 * then a shortened slot. Returns {start, end} or null when the day is too full
 * to place it honestly — the caller then parks it in the flexible section
 * rather than forcing a bad slot.
 */
function suggestSlot(entry, busy, notBefore) {
  const windowLength = entry.endMin - entry.startMin;
  const lengths = [Math.min(PREFERRED_SLOT, windowLength), Math.min(MIN_SLOT, windowLength)];
  const starts = [];
  if (notBefore != null && notBefore > entry.startMin) starts.push(Math.min(notBefore, entry.endMin));
  starts.push(entry.startMin);

  for (const length of lengths) {
    for (const from of starts) {
      const start = firstFreeSlot(from, entry.endMin, length, busy);
      if (start != null) return { start, end: start + length };
    }
  }
  return null;
}

/** Ids of picked items whose display times overlap each other. */
function computeConflicts(items) {
  const picked = items.filter((it) => it.tier);
  const conflicted = new Set();
  for (let i = 0; i < picked.length; i++) {
    for (let j = i + 1; j < picked.length; j++) {
      const a = picked[i];
      const b = picked[j];
      if (overlaps(a.displayStart, a.displayEnd, b.displayStart, b.displayEnd)) {
        conflicted.add(a.entry.id);
        conflicted.add(b.entry.id);
      }
    }
  }
  return conflicted;
}

/**
 * Build everything the renderer needs for one day.
 *
 * `nowMin` is the current time in minutes when the day being viewed is today,
 * otherwise null — on another day there is no "now" to bias slots toward.
 */
function planDay(entries, picks, nowMin) {
  const dayEntries = entries.slice().sort((a, b) => a.startMin - b.startMin || a.name.localeCompare(b.name));
  const fixed = dayEntries.filter((e) => !e.isFlexible);
  const flexible = dayEntries.filter((e) => e.isFlexible);

  const timeline = fixed.map((entry) => ({
    entry,
    tier: picks[entry.id] || null,
    displayStart: entry.startMin,
    displayEnd: entry.endMin,
    slotted: false,
  }));

  // Only picked items occupy time; unpicked ones are just browsing material.
  const busy = timeline.filter((it) => it.tier).map((it) => [it.displayStart, it.displayEnd]);

  const parked = [];
  for (const entry of flexible) {
    const tier = picks[entry.id] || null;
    if (!tier) {
      parked.push({ entry, tier });
      continue;
    }
    const slot = suggestSlot(entry, busy, nowMin);
    if (!slot) {
      parked.push({ entry, tier });
      continue;
    }
    busy.push([slot.start, slot.end]);
    timeline.push({
      entry,
      tier,
      displayStart: slot.start,
      displayEnd: slot.end,
      slotted: true,
    });
  }

  timeline.sort(
    (a, b) =>
      a.displayStart - b.displayStart ||
      a.displayEnd - b.displayEnd ||
      a.entry.name.localeCompare(b.entry.name)
  );
  parked.sort((a, b) => a.entry.startMin - b.entry.startMin || a.entry.name.localeCompare(b.entry.name));

  return { timeline, parked, conflicts: computeConflicts(timeline) };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PREFERRED_SLOT, MIN_SLOT, overlaps, mergeBusy, firstFreeSlot, suggestSlot, computeConflicts, planDay };
}
