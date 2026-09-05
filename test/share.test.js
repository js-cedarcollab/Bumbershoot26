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

const { agendaForDay } = require("../js/share.js");
const { planDay } = require("../js/schedule.js");
const { formatMin } = require("../js/data.js");

const satPlan = (names) => {
  const day = SCHEDULE.filter((e) => e.day === "Sat");
  const picks = {};
  for (const [name, tier] of Object.entries(names)) {
    picks[day.find((e) => e.name === name).id] = tier;
  }
  return planDay(day, picks, null);
};

test("the agenda lists picks in order with times and stages", () => {
  const text = agendaForDay("SATURDAY", satPlan({ "Bikini Kill": "have", Turnstile: "have" }), formatMin);
  const lines = text.split("\n");
  assert.equal(lines[0], "SATURDAY");
  assert.match(lines[1], /6:15 PM–7:15 PM {2}Bikini Kill · Mural Stage/);
  assert.match(lines[2], /10:15 PM–11:30 PM {2}Turnstile · Fisher Stage/);
});

test("wants, clashes and drop-ins are called out in the text", () => {
  const text = agendaForDay(
    "SATURDAY",
    satPlan({ "Bikini Kill": "have", "Lucy Dacus": "have", Peaches: "want", "Motley Zoo Animal Rescue": "have" }),
    formatMin
  );
  assert.match(text, /Peaches · Mural Stage {2}\(want to see\)/);
  assert.match(text, /Bikini Kill · Mural Stage {2}\(overlaps another pick\)/);
  assert.match(text, /Motley Zoo Animal Rescue · Cat Circus {2}\(drop in anytime\)/);
});

test("unpicked sets never reach the agenda", () => {
  const text = agendaForDay("SATURDAY", satPlan({ Turnstile: "have" }), formatMin);
  assert.equal(text.split("\n").length, 2);
  assert.equal(text.includes("Bikini Kill"), false);
});

test("a day with no picks says so rather than printing an empty list", () => {
  const text = agendaForDay("SUNDAY", planDay(SCHEDULE.filter((e) => e.day === "Sun"), {}, null), formatMin);
  assert.deepEqual(text.split("\n"), ["SUNDAY", "  nothing picked yet"]);
});

test("a flexible pick with nowhere to slot still appears, under its own heading", () => {
  const day = SCHEDULE.filter((e) => e.day === "Sat");
  const cats = day.find((e) => e.name === "Motley Zoo Animal Rescue");
  // Fill the whole window so the drop-in cannot be placed in the timeline.
  const picks = { [cats.id]: "have" };
  for (const e of day) {
    if (!e.isFlexible && e.startMin >= cats.startMin && e.endMin <= cats.endMin) picks[e.id] = "have";
  }
  const plan = planDay(day, picks, null);
  assert.ok(plan.parked.some((it) => it.entry.id === cats.id), "the drop-in should be parked");
  const text = agendaForDay("SATURDAY", plan, formatMin);
  assert.match(text, /— fit in when you can —/);
  assert.match(text, /Motley Zoo Animal Rescue · Cat Circus {2}\(drop in anytime\)/);
});
