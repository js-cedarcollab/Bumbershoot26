const test = require("node:test");
const assert = require("node:assert/strict");

const { planDay, suggestSlot, firstFreeSlot, computeConflicts } = require("../js/schedule.js");
const { SCHEDULE } = require("../js/data.js");

const at = (h, m = 0) => h * 60 + m;
const entry = (over) => ({
  id: over.id,
  day: "Sat",
  name: over.name || over.id,
  stage: "Stage",
  category: "Music",
  startMin: over.startMin,
  endMin: over.endMin,
  isFlexible: !!over.isFlexible,
});

test("firstFreeSlot finds the first gap that fits", () => {
  const busy = [[at(13), at(14)], [at(14, 30), at(15)]];
  assert.equal(firstFreeSlot(at(12), at(17), 30, busy), at(12));
  assert.equal(firstFreeSlot(at(13), at(17), 30, busy), at(14), "the exact 14:00–14:30 gap fits");
  assert.equal(firstFreeSlot(at(13), at(17), 20, busy), at(14));
});

test("firstFreeSlot returns null when the window has no room", () => {
  assert.equal(firstFreeSlot(at(13), at(14), 30, [[at(13), at(14)]]), null);
  assert.equal(firstFreeSlot(at(13), at(13, 20), 30, []), null);
});

test("suggestSlot prefers a slot at or after now", () => {
  const flex = entry({ id: "magic", startMin: at(13), endMin: at(16), isFlexible: true });
  assert.deepEqual(suggestSlot(flex, [], null), { start: at(13), end: at(13, 30) });
  assert.deepEqual(suggestSlot(flex, [], at(14, 15)), { start: at(14, 15), end: at(14, 45) });
});

test("suggestSlot falls back to a shorter slot before giving up", () => {
  const flex = entry({ id: "magic", startMin: at(13), endMin: at(16), isFlexible: true });
  const busy = [[at(13), at(14, 40)], [at(15), at(16)]];
  assert.deepEqual(suggestSlot(flex, busy, null), { start: at(14, 40), end: at(15) });
});

test("a picked flexible item is slotted into the first open gap, not its full window", () => {
  const entries = [
    entry({ id: "set", startMin: at(13), endMin: at(14) }),
    entry({ id: "cats", startMin: at(12, 30), endMin: at(19, 30), isFlexible: true }),
  ];
  const { timeline, parked } = planDay(entries, { set: "have", cats: "want" }, null);
  assert.equal(parked.length, 0);
  const cats = timeline.find((it) => it.entry.id === "cats");
  assert.ok(cats.slotted);
  assert.equal(cats.displayStart, at(12, 30));
  assert.equal(cats.displayEnd, at(13));
});

test("flexible items reflow when a new pick closes their gap", () => {
  const entries = [
    entry({ id: "early", startMin: at(12, 30), endMin: at(13) }),
    entry({ id: "cats", startMin: at(12, 30), endMin: at(19, 30), isFlexible: true }),
  ];
  const before = planDay(entries, { cats: "have" }, null);
  assert.equal(before.timeline.find((it) => it.entry.id === "cats").displayStart, at(12, 30));

  const after = planDay(entries, { cats: "have", early: "have" }, null);
  assert.equal(after.timeline.find((it) => it.entry.id === "cats").displayStart, at(13));
});

test("a flexible pick with no usable gap is parked, never force-slotted", () => {
  const entries = [
    entry({ id: "block", startMin: at(13), endMin: at(16) }),
    entry({ id: "magic", startMin: at(13), endMin: at(16), isFlexible: true }),
  ];
  const { timeline, parked } = planDay(entries, { block: "have", magic: "want" }, null);
  assert.deepEqual(parked.map((it) => it.entry.id), ["magic"]);
  assert.equal(timeline.some((it) => it.entry.id === "magic"), false);
});

test("unpicked flexible items stay out of the timeline but remain pickable", () => {
  const entries = [entry({ id: "cats", startMin: at(12, 30), endMin: at(19, 30), isFlexible: true })];
  const { timeline, parked } = planDay(entries, {}, null);
  assert.equal(timeline.length, 0);
  assert.deepEqual(parked.map((it) => it.entry.id), ["cats"]);
});

test("conflicts use the suggested slot, not the full flexible window", () => {
  const entries = [
    entry({ id: "cats", startMin: at(12, 30), endMin: at(19, 30), isFlexible: true }),
    entry({ id: "headliner", startMin: at(18), endMin: at(19) }),
  ];
  const { conflicts } = planDay(entries, { cats: "have", headliner: "have" }, null);
  assert.equal(conflicts.size, 0, "a drop-in should not clash with the whole evening");
});

test("overlapping fixed picks are flagged as conflicts", () => {
  const items = [
    { entry: { id: "a" }, tier: "have", displayStart: at(18), displayEnd: at(19) },
    { entry: { id: "b" }, tier: "want", displayStart: at(18, 30), displayEnd: at(19, 30) },
    { entry: { id: "c" }, tier: "have", displayStart: at(19, 30), displayEnd: at(20) },
  ];
  assert.deepEqual([...computeConflicts(items)].sort(), ["a", "b"]);
});

test("back-to-back picks do not count as a conflict", () => {
  const items = [
    { entry: { id: "a" }, tier: "have", displayStart: at(18), displayEnd: at(19) },
    { entry: { id: "b" }, tier: "have", displayStart: at(19), displayEnd: at(20) },
  ];
  assert.equal(computeConflicts(items).size, 0);
});

test("real lineup data is well formed", () => {
  assert.equal(SCHEDULE.length, 142);
  assert.equal(new Set(SCHEDULE.map((e) => e.id)).size, SCHEDULE.length);
  for (const e of SCHEDULE) {
    assert.ok(e.endMin > e.startMin, `${e.name} has a non-positive duration`);
    assert.ok(["Sat", "Sun"].includes(e.day));
    assert.ok(["Music", "Arts"].includes(e.category));
  }
  const flexible = SCHEDULE.filter((e) => e.isFlexible);
  assert.equal(flexible.length, 12);
  assert.ok(flexible.every((e) => e.endMin - e.startMin >= 120));
});

test("planning a real festival day places every entry exactly once", () => {
  const sat = SCHEDULE.filter((e) => e.day === "Sat");
  const picks = Object.fromEntries(sat.filter((_, i) => i % 5 === 0).map((e) => [e.id, "have"]));
  const { timeline, parked } = planDay(sat, picks, at(16));
  assert.equal(timeline.length + parked.length, sat.length);
  assert.equal(new Set([...timeline, ...parked].map((it) => it.entry.id)).size, sat.length);
});

const { findTightTurnarounds } = require("../js/schedule.js");

const item = (over) => ({
  entry: { id: over.id, name: over.id, stage: over.stage || "Stage A" },
  tier: over.tier === undefined ? "have" : over.tier,
  displayStart: over.start,
  displayEnd: over.end,
  slotted: !!over.slotted,
});

test("back-to-back picks on different stages are flagged as tight", () => {
  const tight = findTightTurnarounds([
    item({ id: "dacus", stage: "Fisher Stage", start: at(18, 45), end: at(19, 45) }),
    item({ id: "molchat", stage: "Mural Stage", start: at(19, 50), end: at(20, 45) }),
  ]);
  assert.equal(tight.get("molchat").minutes, 5);
  assert.equal(tight.get("molchat").from.name, "dacus");
  assert.equal(tight.has("dacus"), false, "the flag belongs on the set you might be late for");
});

test("a comfortable gap is not flagged", () => {
  const tight = findTightTurnarounds([
    item({ id: "a", stage: "Fisher Stage", start: at(18), end: at(19) }),
    item({ id: "b", stage: "Mural Stage", start: at(19, 30), end: at(20) }),
  ]);
  assert.equal(tight.size, 0);
});

test("back-to-back sets on the same stage need no walk", () => {
  const tight = findTightTurnarounds([
    item({ id: "a", stage: "Mural Stage", start: at(18), end: at(19) }),
    item({ id: "b", stage: "Mural Stage", start: at(19), end: at(20) }),
  ]);
  assert.equal(tight.size, 0);
});

test("overlapping picks are conflicts, not tight turnarounds", () => {
  const tight = findTightTurnarounds([
    item({ id: "a", stage: "Fisher Stage", start: at(18), end: at(19) }),
    item({ id: "b", stage: "Mural Stage", start: at(18, 30), end: at(19, 30) }),
  ]);
  assert.equal(tight.size, 0);
});

test("unpicked sets and movable drop-ins are ignored", () => {
  const tight = findTightTurnarounds([
    item({ id: "a", stage: "Fisher Stage", start: at(18), end: at(19) }),
    item({ id: "unpicked", stage: "Mural Stage", start: at(19, 5), end: at(20), tier: null }),
    item({ id: "dropin", stage: "Magic Dome", start: at(19, 5), end: at(19, 35), slotted: true }),
  ]);
  assert.equal(tight.size, 0);
});

test("the tightest of several turnarounds wins", () => {
  const tight = findTightTurnarounds([
    item({ id: "a", stage: "Fisher Stage", start: at(18), end: at(19) }),
    item({ id: "b", stage: "Mural Stage", start: at(18, 30), end: at(19, 2) }),
    item({ id: "c", stage: "Upper NW Courtyard", start: at(19, 5), end: at(20) }),
  ]);
  assert.equal(tight.get("c").minutes, 3);
  assert.equal(tight.get("c").from.name, "b");
});

test("planDay reports tight turnarounds alongside conflicts", () => {
  const entries = [
    entry({ id: "dacus", name: "Lucy Dacus", startMin: at(18, 45), endMin: at(19, 45) }),
    entry({ id: "molchat", name: "Molchat Doma", startMin: at(19, 50), endMin: at(20, 45) }),
  ];
  entries[0].stage = "Fisher Stage";
  entries[1].stage = "Mural Stage";
  const { tight } = planDay(entries, { dacus: "have", molchat: "want" }, null);
  assert.equal(tight.get("molchat").minutes, 5);
});
