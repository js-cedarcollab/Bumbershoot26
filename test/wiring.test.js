const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = fs.readFileSync(path.join(__dirname, "..", "js", "app.js"), "utf8");
const markup = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

/**
 * Controls that must own a listener. A refactor once dropped the search box's
 * `input` handler while leaving every other mention of it in place, so the box
 * looked wired and silently did nothing; merely referencing the id is not
 * enough evidence, the id has to reach an addEventListener.
 */
const MUST_BE_WIRED = [
  "search",
  "search-clear",
  "stage-filter",
  "filters-btn",
  "filter-reset",
  "who",
  "jump-now",
  "sheet",
  "sheet-backdrop",
  "import-banner",
  "board",
];

for (const id of MUST_BE_WIRED) {
  test(`#${id} is wired to a listener`, () => {
    assert.ok(markup.includes(`id="${id}"`), `#${id} should exist in index.html`);
    const wired = new RegExp(
      `getElementById\\("${id}"\\)[\\s\\S]{0,200}?addEventListener`
    ).test(app);
    assert.ok(wired, `#${id} is never given an addEventListener in app.js`);
  });
}

/** Groups handled by class rather than id. */
const CLASS_HANDLERS = ["day-btn", "lg-btn", "cat-btn", "rec-btn", "day-col"];
for (const cls of CLASS_HANDLERS) {
  test(`.${cls} controls are wired`, () => {
    assert.ok(markup.includes(`class="${cls}`) || markup.includes(` ${cls}`), `.${cls} should exist in index.html`);
    const wired = new RegExp(`querySelectorAll\\("\\.${cls}"\\)[\\s\\S]{0,200}?addEventListener`).test(app);
    assert.ok(wired, `.${cls} is never given an addEventListener in app.js`);
  });
}

test("every id app.js reaches for exists in the markup or is built by app.js", () => {
  const missing = [...app.matchAll(/getElementById\("([a-z-]+)"\)/g)]
    .map((m) => m[1])
    // Ids built per day (list-Sat, upnext-Sun, now-line-Sat) are template-built.
    .filter((id) => !/^(list|upnext|now-line)-/.test(id))
    // Sheet contents are rendered by app.js itself, so its own markup counts.
    .filter((id) => !markup.includes(`id="${id}"`) && !app.includes(`id="${id}"`));
  assert.deepEqual([...new Set(missing)], []);
});
