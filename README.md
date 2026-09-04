# Bumbershoot 2026 — My Schedule

A personal schedule planner for Bumbershoot 2026 (Saturday Sep 5 & Sunday Sep 6, Seattle Center).
Tap a set to mark it **have to see** or **want to see**, and the app flags clashes, keeps the
list parked on whatever is happening right now, and finds gaps for the drop-in-anytime stuff.

It's a plain static site — HTML, CSS and three JavaScript files. No build step, no framework,
no backend, no accounts, no analytics.

**Your picks never leave your device.** They live in your browser's `localStorage` under the key
`bumbershoot2026-picks`, and nothing is ever sent anywhere. Clearing your browser data (or tapping
*Clear picks*) is the only way they disappear — and picks made on your phone won't show up on your
laptop, because there's nothing syncing them.

## Run it

Locally — any static file server will do:

```bash
git clone https://github.com/js-cedarcollab/Bumbershoot26.git
cd Bumbershoot26
npm start           # or: python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Opening `index.html` directly as a `file://` URL mostly works too, but the offline service worker
only registers over `http(s)`.

## Publish your own copy

Fork the repo, then in **Settings → Pages** either:

- pick **Deploy from a branch** → your default branch, folder `/ (root)`; or
- pick **GitHub Actions**, which uses the included `.github/workflows/pages.yml`.

Nothing needs building, so the site is live a minute later at
`https://<your-username>.github.io/<repo>/`. On a phone, **Add to Home Screen** installs it as a
standalone app, and the service worker keeps it working when the festival grounds eat your signal.

## What it does

**Now view.** When you open the app on a festival day, it starts anchored at *now minus 15 minutes*
rather than at the top of the day, with the previous set or two still visible above the `NOW`
divider. Sets that already ended are dimmed, not hidden, so scrolling back to review the day still
works, and anything in progress is tagged `ON NOW`. Once you scroll off to browse ahead, a floating
**Jump to now** button appears to snap you back. Returning to the tab re-anchors automatically. If
you tap into the day that *isn't* today, none of that applies — you just get the full day from the
start.

**Flexible items.** Things like the Cat Circus (12:30–7:30 PM) or the Magic Dome sets run for hours
but you drop in whenever; blocking out the whole window would make everything look like a conflict.
Those entries are hand-flagged in `js/data.js` and live in a **Flexible — fit in when you can**
section at the bottom of the day. Pick one and it moves into the timeline at the first open gap in
its real window — shown as a normal 30-minute row reading *(drop in anytime, actually runs
1:00–4:00 PM)*. Add a pick that closes that gap and it reflows to the next one; if the day gets too
full to place it honestly, it moves back to the flexible section rather than being wedged into a bad
slot. Suggested slots also skip gaps that have already passed.

**Conflicts.** Any two picks whose times overlap get a yellow `Overlaps another pick` flag, and the
header keeps a running `have · want · clashing` count. Flexible items are compared using their
suggested slot, not their full multi-hour window.

## Editing the lineup

`js/data.js` holds the raw lineup exactly as it came off the festival's schedule, plus:

- `FLEXIBLE_KEYS` — the hand-picked list of drop-in-anytime entries, keyed `day|name|start`. It's
  deliberately a hand list rather than a duration cutoff: the long Comedy Coop sets and VIDEORAMA
  film blocks run past 90 minutes too, but those really are programs you sit through.
- The normalizer that turns each row into `{ id, day, name, stage, category, startMin, endMin,
  isFlexible }`, the shape the rest of the app uses.

Add or edit a row there and the app picks it up on reload. Ids are derived from day, name and start
time, so editing a set's name or time drops any pick previously saved against it.

## Testing

```bash
npm test
```

Runs the Node test suite over the gap-finding, reflow and conflict logic in `js/schedule.js`, plus
a sanity check of the lineup data. No dependencies.

To see the "now" behaviour outside the festival weekend, append a clock override:
[`?now=Sat@18:05`](http://localhost:8000/?now=Sat@18:05) pretends it's 6:05 PM on the Saturday.

## Layout

```
index.html          markup and page shell
css/app.css         all styling
js/data.js          lineup data, flexible flags, normalizer
js/schedule.js      gap-finding, slot suggestion, conflict detection (pure, tested)
js/app.js           storage, rendering, "now" anchoring, interaction
sw.js               offline cache
test/               node --test suite
```

## Not included, on purpose

No Spotify integration, no accounts, no sync, no backend. One device, one weekend.

## License

MIT — see [LICENSE](LICENSE).
