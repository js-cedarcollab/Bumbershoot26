# Bumbershoot 2026 — My Schedule

A personal schedule planner for Bumbershoot 2026 (Saturday Sep 5 & Sunday Sep 6, Seattle Center).
Tap a set to mark it **have to see** or **want to see**, and the app flags clashes, keeps the
list parked on whatever is happening right now, and finds gaps for the drop-in-anytime stuff.

It's a plain static site — HTML, CSS and three JavaScript files. No build step, no framework,
no backend, no accounts, no analytics.

**Your picks never leave your device.** Up to five people can share one device, each with their own
picks in `localStorage` under `bumbershoot2026-picks:<name>`. Nothing is ever sent anywhere on its
own — the only way a plan moves between devices is a share link you create deliberately.

One caveat worth knowing if you plan weeks ahead: Safari clears site storage after about seven days
of not visiting a site. Adding the app to your home screen mostly exempts it, and a share link
doubles as a real backup.

**Two layouts.** Under 900px it's a single day with tabs, sized for a phone. At 900px and up both
days sit side by side with their own scrolling, the day tabs disappear, and the filters stay open —
which is the view for planning at home before texting yourself a share link. In Chrome or Edge the
page can also be installed from the address bar, so it gets its own window and icon.

## Run it

The service worker is network-first with a 2.5-second timeout, so a refresh always shows the code
you just pushed and a dead signal on the festival grounds falls back to the cached copy rather than
hanging.

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

**Conflicts and travel time.** Two picks that overlap get a yellow `Overlaps another pick` flag.
Two picks on *different stages* with under 10 minutes between them get a quieter amber note on the
later set — the walk across the grounds is a conflict too, just not the kind most schedule apps
count. That's one flat number rather than invented stage-to-stage distances, since the lineup data
has no map in it; change `TIGHT_TURNAROUND` in `js/schedule.js` if you walk slower. Flexible items
are compared using their suggested slot, not their full multi-hour window, and are exempt from the
walking check because their slot can simply move.

**Up next.** When a pick starts within 20 minutes, a bar pins above the list with what's coming and
where. If it starts while another pick is still playing, the bar turns yellow and tells you what
you'd be walking out of, and until when — the case that actually costs you a set. Tapping it jumps
to the row.

**People.** A name picker holds up to five people on one device, each with separate picks. Tap your
name to switch, add someone, share, or clear.

**Share links.** *Share my picks* builds a link with your whole pick list packed into the URL
fragment — two bits per entry, so the entire weekend fits in 55 characters and survives a text
message. Plan on a desktop, text it to yourself, open it on your phone. Opening someone's link
never overwrites anything: a banner offers *open as them* or *merge into mine*, and nothing is
written until you choose. Links carry a fingerprint of the lineup they were built from, so a link
made against different data is reported as stale instead of silently decoded into the wrong sets.

**Busy-then markers.** Anything you haven't picked that runs into something you have is marked
inline — a red dot for "Have to see Bikini Kill then", blue for a want. This is aimed at the
recurring arts: Bellingham Buddies plays six times a day and the only question that matters is
which of those slots is still open. The **Free** filter takes it further and shows only sets that
clash with nothing you've picked, so a filled-up day gets shorter as you plan. Drop-ins are left
out of the calculation on both sides, since their slot moves anyway.

**Copy my agenda.** For friends who want your plan but not your app: *Copy my agenda as text* in
the name menu builds a deliberately thin list — a time and a name per line, because it gets read in
a text message.

```
Jesse's Bumbershoot 2026

Saturday
12:30p Motley Zoo Animal Rescue (anytime)
5:00p Peaches (maybe)
6:15p Bikini Kill
```

No stages, no end times, no clash warnings: those are for the person doing the planning, not the
person being told where you'll be. The only two annotations that survive are the ones that would
otherwise mislead — a maybe isn't a promise, and a drop-in's time is the app's suggestion rather
than a set time.

**Search and filters.** The legend is the filter: *Have to see* and *Want to see* are independent
toggles, and *Conflicts* and *Free time* are whole views that replace a tier selection rather than
stacking with it. Search covers artist and stage names (accent-insensitive; `/` focuses it, Escape
clears). Everything else — category, The Stranger's picks, and stage — lives behind a **Filters**
button that shows how many are active, and is always open on wide screens. Filters compose, and
they're view-only: hiding rows never changes which gaps are open or which picks clash.

The stage list is grouped into music stages and arts districts, and leaves out venues that host a
single act — Bumbershoot's own data labels Cat Circus and Una The Mermaid as "stages", where
filtering by the stage is identical to searching the act. They're still findable in search.

## The Stranger's picks

`js/recs.js` carries The Stranger's Bumbershoot 2026 coverage as an overlay: which acts they
starred ("Stranger recommends"), which they flagged as local, and a short credited quote from each
writeup. Rows show ★/Local badges and the quote, a **★ Picks / Local** filter composes with the
others, and a credit line under the list links back to all three articles. Empty the list and the
whole feature disappears from the UI.

Two kinds of entry. Most name an act. Those with `stage: true` name one of the arts districts and
apply to *every* set on that stage — the arts article reviews districts (Comedy Coop, Magic Dome,
Rooftop District) rather than individual shows. A district star renders as "★ Stranger pick: this
district" so a starred venue never reads as a starred set, and an act's own rec always wins over
the district it plays in.

```js
const STRANGER_RECS = [
  { name: "Turnstile", star: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Julianne Bell", blurb: "…" },
  { name: "Comedy Coop", stage: true, star: true, url: STRANGER_SOURCES.Arts,
    author: "Sam Machkovech", blurb: "…" },
];
```

Four sets carry no rec, because the articles don't cover them: Hard Maybe, Mofiyah, Noire Svlon and
Muckleshoot. The Stranger also starred **Yves Tumor**, who isn't in this lineup snapshot at all —
the Sunday 9:30 PM Mural Stage slot is Tokimonsta here.

Names are matched loosely — casing, punctuation, accents and `&` vs `and` all survive, and "WITCH"
finds "W.I.T.C.H." One entry covers every set that act plays, which is what you want for the arts
acts that recur all weekend. Any name matching nothing in the lineup is reported in the browser
console at startup and fails `npm test`, so a typo or a renamed act can't slip through silently.

**On their descriptions.** Which acts got a star is a fact about their coverage; the writing next to
those stars is their work. Each rec carries a *short* excerpt rather than the full writeup, rendered
in quotation marks and credited to the writer who wrote it, plus a `url` so every row's source is a
click away. If you'd rather ship no quotes at all, delete the `blurb` fields — the stars, local
flags and filter keep working without them.

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

Runs the Node test suite over the gap-finding, reflow, conflict and travel-time logic in
`js/schedule.js`, the share links and text agenda in `js/share.js`, the rec matching in
`js/recs.js`, a sanity check of the lineup data, and a wiring check that every interactive control
in `index.html` actually reaches an `addEventListener` in `js/app.js`. No dependencies.

To see the "now" behaviour outside the festival weekend, append a clock override:
[`?now=Sat@18:05`](http://localhost:8000/?now=Sat@18:05) pretends it's 6:05 PM on the Saturday.

## Layout

```
index.html          markup and page shell
css/app.css         all styling
js/data.js          lineup data, flexible flags, normalizer
js/schedule.js      gap-finding, slot suggestion, conflicts, travel time (pure, tested)
js/share.js         share-link encoding, fingerprint, text agenda (pure, tested)
js/recs.js          optional Stranger picks overlay and name matching (pure, tested)
js/app.js           people, storage, rendering, "now" anchoring, filters, interaction
sw.js               offline cache
test/               node --test suite
```

## Not included, on purpose

No Spotify integration, no accounts, no server-side sync, no backend, no analytics.

The lineup in `js/data.js` is a **static snapshot**, not a live feed. A static site can't fetch
bumbershoot.com directly (the browser blocks cross-origin reads, and there's no server here to do
it), so day-of set changes don't appear on their own — updating the file and pushing is the way
they land. Because pick ids are built from day, name and start time, a set that moves time loses
any pick saved against it.

## License

MIT — see [LICENSE](LICENSE).
