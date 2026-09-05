const test = require("node:test");
const assert = require("node:assert/strict");

const { matchRecs, recKey, STRANGER_RECS } = require("../js/recs.js");
const { SCHEDULE } = require("../js/data.js");

test("names match across casing, punctuation and ampersands", () => {
  assert.equal(recKey("Joey Valence & Brae"), recKey("joey valence and brae"));
  assert.equal(recKey("Chase & Status"), recKey("Chase and Status"));
  assert.equal(recKey("Aryana León"), recKey("aryana leon"));
});

test("initialised names still match without their dots", () => {
  const { byId, unmatched } = matchRecs(SCHEDULE, [{ name: "WITCH", star: true }]);
  const witch = SCHEDULE.find((e) => e.name === "W.I.T.C.H.");
  assert.deepEqual(unmatched, []);
  assert.equal(byId.get(witch.id).star, true);
});

test("a rec attaches to the real set it names", () => {
  const { byId, unmatched } = matchRecs(SCHEDULE, [{ name: "Turnstile", star: true }]);
  const turnstile = SCHEDULE.find((e) => e.name === "Turnstile");
  assert.deepEqual(unmatched, []);
  assert.equal(byId.get(turnstile.id).star, true);
  assert.equal(byId.get(turnstile.id).local, false);
});

test("one rec covers every set that act plays, both days", () => {
  const { byId } = matchRecs(SCHEDULE, [{ name: "Una the Mermaid", local: true }]);
  const all = SCHEDULE.filter((e) => e.name === "Una the Mermaid");
  assert.ok(all.length > 2);
  for (const entry of all) assert.equal(byId.get(entry.id).local, true);
});

test("a rec naming nothing in the lineup is reported, not dropped silently", () => {
  const { byId, unmatched } = matchRecs(SCHEDULE, [
    { name: "Turnstile", star: true },
    { name: "Some Band That Cancelled", star: true },
  ]);
  assert.deepEqual(unmatched, ["Some Band That Cancelled"]);
  assert.equal(byId.size, 1);
});

test("blurb and url ride along when given", () => {
  const { byId } = matchRecs(SCHEDULE, [
    { name: "Peaches", star: true, blurb: "A short attributed quote.", url: "https://example.com/a" },
  ]);
  const peaches = SCHEDULE.find((e) => e.name === "Peaches");
  assert.equal(byId.get(peaches.id).blurb, "A short attributed quote.");
  assert.equal(byId.get(peaches.id).url, "https://example.com/a");
});

test("the shipped rec list, whatever is in it, matches the lineup", () => {
  const { unmatched } = matchRecs(SCHEDULE, STRANGER_RECS);
  assert.deepEqual(unmatched, [], `these rec names match no set: ${unmatched.join(", ")}`);
});
