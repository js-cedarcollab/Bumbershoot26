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
const { formatShort } = require("../js/data.js");

const satPlan = (names) => {
  const day = SCHEDULE.filter((e) => e.day === "Sat");
  const picks = {};
  for (const [name, tier] of Object.entries(names)) {
    picks[day.find((e) => e.name === name).id] = tier;
  }
  return planDay(day, picks, null);
};

test("the agenda is one line per pick: time, then name", () => {
  const text = agendaForDay("Saturday", satPlan({ "Bikini Kill": "have", Turnstile: "have" }), formatShort);
  assert.deepEqual(text.split("\n"), ["Saturday", "6:15p Bikini Kill", "10:15p Turnstile"]);
});

test("stages, end times and clash warnings stay out of the text", () => {
  const text = agendaForDay(
    "Saturday",
    satPlan({ "Bikini Kill": "have", "Lucy Dacus": "have" }),
    formatShort
  );
  assert.equal(text.includes("Mural Stage"), false);
  assert.equal(text.includes("overlaps"), false);
  assert.equal(text.includes("–"), false, "no end times");
});

test("a maybe is marked, because it isn't a promise", () => {
  const text = agendaForDay("Saturday", satPlan({ Peaches: "want", Turnstile: "have" }), formatShort);
  assert.match(text, /^5:00p Peaches \(maybe\)$/m);
  assert.match(text, /^10:15p Turnstile$/m);
});

test("a drop-in's suggested time is marked, because it isn't a set time", () => {
  const text = agendaForDay("Saturday", satPlan({ "Motley Zoo Animal Rescue": "have" }), formatShort);
  assert.match(text, /Motley Zoo Animal Rescue \(anytime\)/);
});

test("unpicked sets never reach the agenda", () => {
  const text = agendaForDay("Saturday", satPlan({ Turnstile: "have" }), formatShort);
  assert.equal(text.split("\n").length, 2);
  assert.equal(text.includes("Bikini Kill"), false);
});

test("a day with no picks says so rather than printing an empty list", () => {
  const text = agendaForDay("Sunday", planDay(SCHEDULE.filter((e) => e.day === "Sun"), {}, null), formatShort);
  assert.deepEqual(text.split("\n"), ["Sunday", "nothing picked yet"]);
});

test("a flexible pick with nowhere to slot still appears, marked anytime", () => {
  const day = SCHEDULE.filter((e) => e.day === "Sat");
  const cats = day.find((e) => e.name === "Motley Zoo Animal Rescue");
  const picks = { [cats.id]: "have" };
  for (const e of day) {
    if (!e.isFlexible && e.startMin >= cats.startMin && e.endMin <= cats.endMin) picks[e.id] = "have";
  }
  const plan = planDay(day, picks, null);
  assert.ok(plan.parked.some((it) => it.entry.id === cats.id), "the drop-in should be parked");
  assert.match(agendaForDay("Saturday", plan, formatShort), /Motley Zoo Animal Rescue \(anytime\)/);
});

test("compact times read unambiguously across the festival day", () => {
  assert.equal(formatShort(12 * 60 + 30), "12:30p");
  assert.equal(formatShort(17 * 60), "5:00p");
  assert.equal(formatShort(23 * 60 + 30), "11:30p");
});
