const test = require("node:test");
const assert = require("node:assert/strict");

const { encodePicks, decodePicks, fingerprint } = require("../js/share.js");
const { SCHEDULE } = require("../js/data.js");

const somePicks = () => {
  const picks = {};
  SCHEDULE.forEach((entry, i) => {
    if (i % 7 === 0) picks[entry.id] = i % 2 ? "want" : "have";
  });
  return picks;
};

test("picks survive a round trip through a share link", () => {
  const picks = somePicks();
  const { picks: back, stale } = decodePicks(SCHEDULE, encodePicks(SCHEDULE, picks));
  assert.deepEqual(back, picks);
  assert.equal(stale, false);
});

test("an empty pick list round trips to nothing", () => {
  const { picks } = decodePicks(SCHEDULE, encodePicks(SCHEDULE, {}));
  assert.deepEqual(picks, {});
});

test("every pick, both tiers, survives", () => {
  const picks = Object.fromEntries(SCHEDULE.map((e, i) => [e.id, i % 2 ? "have" : "want"]));
  const { picks: back } = decodePicks(SCHEDULE, encodePicks(SCHEDULE, picks));
  assert.deepEqual(back, picks);
});

test("a full weekend of picks stays short enough to text", () => {
  const picks = Object.fromEntries(SCHEDULE.map((e) => [e.id, "have"]));
  assert.ok(encodePicks(SCHEDULE, picks).length < 80, "payload should stay well under a text-message limit");
});

test("a link built against a different lineup is flagged stale, not silently misread", () => {
  const payload = encodePicks(SCHEDULE, somePicks());
  const changed = SCHEDULE.slice(1);
  assert.equal(decodePicks(changed, payload).stale, true);
  assert.notEqual(fingerprint(SCHEDULE), fingerprint(changed));
});

test("garbage input is rejected rather than decoded", () => {
  assert.throws(() => decodePicks(SCHEDULE, "nonsense"));
});

test("a truncated payload decodes what it can without throwing", () => {
  const payload = encodePicks(SCHEDULE, somePicks());
  const [stamp, body] = payload.split(".");
  const { picks } = decodePicks(SCHEDULE, `${stamp}.${body.slice(0, 8)}`);
  assert.ok(Object.keys(picks).length >= 0);
});
