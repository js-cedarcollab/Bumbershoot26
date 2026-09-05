/**
 * Share links: the whole pick list packed into a URL fragment.
 *
 * The link doubles as a backup and as the way to move a plan from a desktop to
 * a phone, so it has to survive being pasted into a text message: two bits per
 * schedule entry (none / have / want) packed into bytes and base64url'd, which
 * keeps the entire weekend under 60 characters.
 *
 * Positions are schedule indices, so a link only means anything against the
 * lineup it was made from. A short fingerprint of the lineup rides along, and a
 * mismatch is reported rather than silently decoded into the wrong sets.
 */

const TIER_BITS = { have: 1, want: 2 };
const BITS_TO_TIER = { 1: "have", 2: "want" };

/** FNV-1a over every id, as 6 base36 chars — enough to catch a lineup change. */
function fingerprint(schedule) {
  let hash = 0x811c9dc5;
  for (const entry of schedule) {
    for (let i = 0; i < entry.id.length; i++) {
      hash ^= entry.id.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  }
  return hash.toString(36).padStart(6, "0").slice(-6);
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** Pack picks into "<fingerprint>.<base64url>". */
function encodePicks(schedule, picks) {
  const bytes = new Uint8Array(Math.ceil(schedule.length / 4));
  schedule.forEach((entry, index) => {
    const bits = TIER_BITS[picks[entry.id]] || 0;
    if (bits) bytes[index >> 2] |= bits << ((index % 4) * 2);
  });
  return `${fingerprint(schedule)}.${bytesToBase64Url(bytes)}`;
}

/**
 * Unpack a share payload.
 *
 * Returns { picks, stale } — `stale` means the link was built against a
 * different lineup, so the caller can warn instead of trusting the positions.
 * Throws only on input that isn't a share payload at all.
 */
function decodePicks(schedule, payload) {
  const [stamp, body] = String(payload).split(".");
  if (!stamp || !body) throw new Error("Not a share link");
  const bytes = base64UrlToBytes(body);
  const picks = {};
  schedule.forEach((entry, index) => {
    const byte = bytes[index >> 2];
    if (byte === undefined) return;
    const tier = BITS_TO_TIER[(byte >> ((index % 4) * 2)) & 0b11];
    if (tier) picks[entry.id] = tier;
  });
  return { picks, stale: stamp !== fingerprint(schedule) };
}

/**
 * A plain-text agenda for one day — for the friends who want your plan but not
 * your app.
 *
 * Deliberately thin: a time and a name per line, because this gets read in a
 * text message. No stages, no end times, no clash warnings — those are for the
 * person doing the planning, not the person being told where you'll be. The
 * only annotations that survive are the two that would otherwise mislead:
 * a maybe is not a promise, and a drop-in's time is a suggestion, not a set.
 */
function agendaForDay(label, plan, formatTime) {
  const lines = [label];
  const picked = plan.timeline.filter((it) => it.tier);

  if (!picked.length && !plan.parked.some((it) => it.tier)) {
    lines.push("nothing picked yet");
  }
  for (const item of picked) {
    const note = item.slotted ? " (anytime)" : item.tier === "want" ? " (maybe)" : "";
    lines.push(`${formatTime(item.displayStart)} ${item.entry.name}${note}`);
  }
  for (const item of plan.parked.filter((it) => it.tier)) {
    lines.push(`${formatTime(item.entry.startMin)} ${item.entry.name} (anytime)`);
  }
  return lines.join("\n");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { encodePicks, decodePicks, fingerprint, agendaForDay };
}
