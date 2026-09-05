/**
 * The Stranger's Bumbershoot picks, as an optional overlay on the lineup.
 *
 * This file holds *facts about* their coverage — which acts got a star
 * ("Stranger recommends") and which are flagged local — plus a link back to the
 * article each came from. Their written descriptions are their work, not ours;
 * `blurb` exists for a short attributed quote if you want one, and every rec
 * carries `url` so the app can send readers to the original rather than
 * republishing it. Leave `entries` empty and the whole feature disappears from
 * the UI.
 *
 * To populate: add one entry per act, with `name` as The Stranger writes it —
 * matching against the lineup is fuzzy, and anything that fails to match is
 * reported in the console at startup so it can be corrected by hand.
 */

const STRANGER_SOURCES = {
  Music: {
    Sat: "https://www.thestranger.com/bumbershoot/every-band-playing-bumbershoot-saturday/",
    Sun: "https://www.thestranger.com/bumbershoot/every-band-playing-bumbershoot-sunday/",
  },
  Arts: "https://www.thestranger.com/arts/every-arts-district-at-bumbershoot-2026/",
};

/**
 * @type {Array<{name: string, star?: boolean, local?: boolean, blurb?: string, url?: string}>}
 */
const STRANGER_RECS = [
  // { name: "Turnstile", star: true, url: STRANGER_SOURCES.Music.Sat },
  // { name: "Oblé Reed", star: true, local: true, url: STRANGER_SOURCES.Music.Sat },
];

/** Loose enough to survive "&" vs "and", punctuation and casing differences. */
function recKey(name) {
  return String(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Same again with separators removed, so "WITCH" still finds "W.I.T.C.H.". */
function tightKey(name) {
  return recKey(name).replace(/ /g, "");
}

/**
 * Attach recs to schedule entries by name.
 *
 * Returns { byId, unmatched } — `unmatched` lists rec names that found no set,
 * which is the only way to catch a typo or a renamed act, so the caller should
 * surface it rather than swallow it.
 */
function matchRecs(schedule, recs) {
  const byKey = new Map();
  const byTight = new Map();
  for (const entry of schedule) {
    for (const [map, key] of [[byKey, recKey(entry.name)], [byTight, tightKey(entry.name)]]) {
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    }
  }

  const byId = new Map();
  const unmatched = [];
  for (const rec of recs) {
    const matches = byKey.get(recKey(rec.name)) || byTight.get(tightKey(rec.name));
    if (!matches) {
      unmatched.push(rec.name);
      continue;
    }
    // One rec covers every set that act plays — the arts acts recur all weekend.
    for (const entry of matches) {
      byId.set(entry.id, {
        star: !!rec.star,
        local: !!rec.local,
        blurb: rec.blurb || "",
        url: rec.url || "",
      });
    }
  }
  return { byId, unmatched };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { STRANGER_RECS, STRANGER_SOURCES, recKey, tightKey, matchRecs };
}
