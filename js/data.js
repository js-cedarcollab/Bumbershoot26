/**
 * Bumbershoot 2026 lineup — Saturday Sep 5 & Sunday Sep 6.
 *
 * RAW rows are carried over verbatim from the source lineup
 * (bumbershoot.com/my-schedule) in their original compact shape:
 *   d = day ('Sat' | 'Sun')
 *   s = start time,  e = end time  (12-hour display strings)
 *   n = name,        g = stage/venue,  c = category ('Music' | 'Arts')
 *
 * FLEXIBLE_KEYS below hand-flags the drop-in-anytime entries. See README.
 */

const RAW = [
// SATURDAY
{d:'Sat',s:'12:30 PM',e:'7:30 PM',n:'Motley Zoo Animal Rescue',g:'Cat Circus',c:'Arts'},
{d:'Sat',s:'12:30 PM',e:'8:00 PM',n:'The Lovejoysters + Levity Arts + Flatchestedmama',g:'Free Range Performances',c:'Arts'},
{d:'Sat',s:'12:30 PM',e:'1:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sat',s:'12:45 PM',e:'1:45 PM',n:'Seattle Asian American Film Festival',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sat',s:'1:00 PM',e:'1:50 PM',n:'LAFF-A-BALL',g:'Comedy Coop',c:'Arts'},
{d:'Sat',s:'1:00 PM',e:'2:00 PM',n:'Skate Like a Girl',g:'Gravity Park',c:'Arts'},
{d:'Sat',s:'1:00 PM',e:'4:00 PM',n:'Taylor Kyle The American Mystifier',g:'Magic Dome',c:'Arts'},
{d:'Sat',s:'1:20 PM',e:'1:50 PM',n:'Hard Maybe',g:'Fisher Stage',c:'Music'},
{d:'Sat',s:'1:30 PM',e:'2:30 PM',n:'High Fashion High — "Dreams"',g:'Fashion Runway',c:'Arts'},
{d:'Sat',s:'1:55 PM',e:'3:10 PM',n:'Three Dollar Bill Cinema + Q&A',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sat',s:'2:00 PM',e:'2:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sat',s:'2:00 PM',e:'4:00 PM',n:'SOS Pro Wrestling BUMBERMANIA!',g:'BUMBERMANIA!',c:'Arts'},
{d:'Sat',s:'2:00 PM',e:'2:50 PM',n:'The Disabled List',g:'Comedy Coop',c:'Arts'},
{d:'Sat',s:'2:00 PM',e:'2:30 PM',n:'XCOMM',g:'Mural Stage',c:'Music'},
{d:'Sat',s:'2:20 PM',e:'2:50 PM',n:'Travis Thompson',g:'Fisher Stage',c:'Music'},
{d:'Sat',s:'2:30 PM',e:'3:00 PM',n:'Meat Hair',g:'Upper NW Courtyard',c:'Music'},
{d:'Sat',s:'2:30 PM',e:'3:30 PM',n:'Ride And Glide',g:'Gravity Park',c:'Arts'},
{d:'Sat',s:'2:30 PM',e:'3:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sat',s:'2:50 PM',e:'3:20 PM',n:'Cain Culto',g:'Mural Stage',c:'Music'},
{d:'Sat',s:'2:55 PM',e:'3:10 PM',n:'K.OVERDRAFT',g:'JUXT — Rooftop District',c:'Arts'},
{d:'Sat',s:'3:00 PM',e:'3:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sat',s:'3:00 PM',e:'3:30 PM',n:'New Affection — "Nightshade"',g:'Fashion Runway',c:'Arts'},
{d:'Sat',s:'3:00 PM',e:'3:50 PM',n:'One Man Show — A (Mostly) Women\u2019s Comedy Show',g:'Comedy Coop',c:'Arts'},
{d:'Sat',s:'3:15 PM',e:'3:45 PM',n:'Pixel Grip',g:'Fisher Stage',c:'Music'},
{d:'Sat',s:'3:20 PM',e:'4:40 PM',n:'Seattle Film Society',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sat',s:'3:30 PM',e:'4:00 PM',n:'Bexley',g:'Upper NW Courtyard',c:'Music'},
{d:'Sat',s:'3:50 PM',e:'4:10 PM',n:'Karin Stevens Dance + Michael Owcharuk',g:'JUXT — Rooftop District',c:'Arts'},
{d:'Sat',s:'3:50 PM',e:'4:35 PM',n:'Silvana Estrada',g:'Mural Stage',c:'Music'},
{d:'Sat',s:'4:00 PM',e:'4:50 PM',n:'#TheBLACKOUT',g:'Comedy Coop',c:'Arts'},
{d:'Sat',s:'4:00 PM',e:'4:30 PM',n:'Alter Ego — "Unframed"',g:'Fashion Runway',c:'Arts'},
{d:'Sat',s:'4:00 PM',e:'4:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sat',s:'4:00 PM',e:'5:00 PM',n:'Dope Planet',g:'Gravity Park',c:'Arts'},
{d:'Sat',s:'4:15 PM',e:'5:00 PM',n:'Die Spitz',g:'Fisher Stage',c:'Music'},
{d:'Sat',s:'4:30 PM',e:'5:00 PM',n:'Aryana León',g:'Upper NW Courtyard',c:'Music'},
{d:'Sat',s:'4:30 PM',e:'5:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sat',s:'4:50 PM',e:'6:15 PM',n:'Seattle Black Film Festival: Becoming + Q&A',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sat',s:'5:00 PM',e:'5:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sat',s:'5:00 PM',e:'5:45 PM',n:'Peaches',g:'Mural Stage',c:'Music'},
{d:'Sat',s:'5:00 PM',e:'8:00 PM',n:'The Maritess Zurbano Magical Experience',g:'Magic Dome',c:'Arts'},
{d:'Sat',s:'5:05 PM',e:'5:25 PM',n:'CypherQueenz B-Girl + Julie Slick',g:'JUXT — Rooftop District',c:'Arts'},
{d:'Sat',s:'5:05 PM',e:'5:35 PM',n:'Vancouver Indigenous Fashion Week — "Earth"',g:'Fashion Runway',c:'Arts'},
{d:'Sat',s:'5:30 PM',e:'7:00 PM',n:'Best of Seattle',g:'Comedy Coop',c:'Arts'},
{d:'Sat',s:'5:30 PM',e:'6:15 PM',n:'Joey Valence & Brae',g:'Fisher Stage',c:'Music'},
{d:'Sat',s:'5:30 PM',e:'6:30 PM',n:'Ride And Glide',g:'Gravity Park',c:'Arts'},
{d:'Sat',s:'5:40 PM',e:'6:10 PM',n:'Juliet Daniel',g:'Upper NW Courtyard',c:'Music'},
{d:'Sat',s:'6:00 PM',e:'6:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sat',s:'6:15 PM',e:'6:45 PM',n:'"Synthesized" by Tech Couture',g:'Fashion Runway',c:'Arts'},
{d:'Sat',s:'6:15 PM',e:'7:15 PM',n:'Bikini Kill',g:'Mural Stage',c:'Music'},
{d:'Sat',s:'6:20 PM',e:'6:40 PM',n:'Crystal Beth + Marissa Rae Niederhauser',g:'JUXT — Rooftop District',c:'Arts'},
{d:'Sat',s:'6:25 PM',e:'7:30 PM',n:'Seattle 48 Hour Film Festival Showcase',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sat',s:'6:30 PM',e:'7:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sat',s:'6:45 PM',e:'7:45 PM',n:'Lucy Dacus',g:'Fisher Stage',c:'Music'},
{d:'Sat',s:'6:50 PM',e:'7:20 PM',n:'Anthers',g:'Upper NW Courtyard',c:'Music'},
{d:'Sat',s:'7:00 PM',e:'8:00 PM',n:'35th North: RAMP RIOT!',g:'Gravity Park',c:'Arts'},
{d:'Sat',s:'7:00 PM',e:'7:30 PM',n:'Bellingham Buddies (PG-13)',g:'Puppet Playhouse',c:'Arts'},
{d:'Sat',s:'7:25 PM',e:'7:55 PM',n:'Prairie Underground — "Resistance Show"',g:'Fashion Runway',c:'Arts'},
{d:'Sat',s:'7:30 PM',e:'8:30 PM',n:'Monica Nevi',g:'Comedy Coop',c:'Arts'},
{d:'Sat',s:'7:40 PM',e:'9:00 PM',n:'Scope Screenings Live Underground Film Festival + Q&A',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sat',s:'7:45 PM',e:'8:45 PM',n:'Molchat Doma',g:'Mural Stage',c:'Music'},
{d:'Sat',s:'7:55 PM',e:'8:40 PM',n:'Sera Cahoone',g:'Upper NW Courtyard',c:'Music'},
{d:'Sat',s:'8:00 PM',e:'8:30 PM',n:'Bellingham Buddies (PG-13)',g:'Puppet Playhouse',c:'Arts'},
{d:'Sat',s:'8:00 PM',e:'10:00 PM',n:'SOS Pro Wrestling BUMBERMANIA!',g:'BUMBERMANIA!',c:'Arts'},
{d:'Sat',s:'8:15 PM',e:'9:30 PM',n:'Blood Orange',g:'Fisher Stage',c:'Music'},
{d:'Sat',s:'8:30 PM',e:'9:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sat',s:'8:40 PM',e:'9:40 PM',n:'Nobi and the Force',g:'Fashion Runway',c:'Arts'},
{d:'Sat',s:'9:00 PM',e:'10:00 PM',n:'Dope Planet — Late Night Special',g:'Gravity Park',c:'Arts'},
{d:'Sat',s:'9:30 PM',e:'10:00 PM',n:'Bellingham Buddies (R-Rated)',g:'Puppet Playhouse',c:'Arts'},
{d:'Sat',s:'9:30 PM',e:'9:55 PM',n:'Mofiyah',g:'Mural Stage',c:'Music'},
{d:'Sat',s:'9:40 PM',e:'10:40 PM',n:'Oblé Reed',g:'Upper NW Courtyard',c:'Music'},
{d:'Sat',s:'10:00 PM',e:'11:15 PM',n:'Chase & Status',g:'Mural Stage',c:'Music'},
{d:'Sat',s:'10:00 PM',e:'10:30 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sat',s:'10:15 PM',e:'11:30 PM',n:'Turnstile',g:'Fisher Stage',c:'Music'},
// SUNDAY
{d:'Sun',s:'12:30 PM',e:'7:30 PM',n:'Motley Zoo Animal Rescue',g:'Cat Circus',c:'Arts'},
{d:'Sun',s:'12:30 PM',e:'8:00 PM',n:'The Lovejoysters + Levity Arts + Flatchestedmama',g:'Free Range Performances',c:'Arts'},
{d:'Sun',s:'12:30 PM',e:'1:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sun',s:'12:45 PM',e:'1:50 PM',n:'Seattle Black Film Festival: Becoming',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sun',s:'1:00 PM',e:'2:00 PM',n:'Skate Like a Girl',g:'Gravity Park',c:'Arts'},
{d:'Sun',s:'1:00 PM',e:'1:50 PM',n:'The Pacific North Weirdos',g:'Comedy Coop',c:'Arts'},
{d:'Sun',s:'1:20 PM',e:'1:50 PM',n:'Noire Svlon',g:'Fisher Stage',c:'Music'},
{d:'Sun',s:'1:30 PM',e:'2:30 PM',n:'High Fashion High — "Dreams"',g:'Fashion Runway',c:'Arts'},
{d:'Sun',s:'1:30 PM',e:'4:30 PM',n:'Ruben Barron: Comedy Magic',g:'Magic Dome',c:'Arts'},
{d:'Sun',s:'2:00 PM',e:'2:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sun',s:'2:00 PM',e:'3:35 PM',n:'Seattle 48 Hour Film Festival Showcase + Q&A',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sun',s:'2:00 PM',e:'4:00 PM',n:'SOS Pro Wrestling BUMBERMANIA!',g:'BUMBERMANIA!',c:'Arts'},
{d:'Sun',s:'2:00 PM',e:'3:15 PM',n:'Takuya Nakamura',g:'Mural Stage',c:'Music'},
{d:'Sun',s:'2:00 PM',e:'2:50 PM',n:'The Disabled List',g:'Comedy Coop',c:'Arts'},
{d:'Sun',s:'2:20 PM',e:'2:50 PM',n:'PawPaw Rod',g:'Fisher Stage',c:'Music'},
{d:'Sun',s:'2:30 PM',e:'3:00 PM',n:'American Flats',g:'Upper NW Courtyard',c:'Music'},
{d:'Sun',s:'2:30 PM',e:'3:30 PM',n:'Ride And Glide',g:'Gravity Park',c:'Arts'},
{d:'Sun',s:'2:30 PM',e:'3:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sun',s:'2:55 PM',e:'3:10 PM',n:'K.OVERDRAFT',g:'JUXT — Rooftop District',c:'Arts'},
{d:'Sun',s:'3:00 PM',e:'3:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sun',s:'3:00 PM',e:'3:30 PM',n:'New Affection — "Nightshade"',g:'Fashion Runway',c:'Arts'},
{d:'Sun',s:'3:00 PM',e:'3:50 PM',n:'Seattle Expats',g:'Comedy Coop',c:'Arts'},
{d:'Sun',s:'3:15 PM',e:'3:45 PM',n:'Sextile',g:'Fisher Stage',c:'Music'},
{d:'Sun',s:'3:30 PM',e:'4:00 PM',n:'Midpak',g:'Upper NW Courtyard',c:'Music'},
{d:'Sun',s:'3:45 PM',e:'4:45 PM',n:'Scope Screenings Live Underground Film Festival',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sun',s:'3:45 PM',e:'4:30 PM',n:'W.I.T.C.H.',g:'Mural Stage',c:'Music'},
{d:'Sun',s:'3:50 PM',e:'4:10 PM',n:'Karin Stevens Dance + Michael Owcharuk',g:'JUXT — Rooftop District',c:'Arts'},
{d:'Sun',s:'4:00 PM',e:'4:50 PM',n:'#TheBLACKOUT',g:'Comedy Coop',c:'Arts'},
{d:'Sun',s:'4:00 PM',e:'5:00 PM',n:'Alchemy Indoor Skate Park & Education Center',g:'Gravity Park',c:'Arts'},
{d:'Sun',s:'4:00 PM',e:'4:30 PM',n:'Alter Ego — "Unframed"',g:'Fashion Runway',c:'Arts'},
{d:'Sun',s:'4:00 PM',e:'4:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sun',s:'4:10 PM',e:'4:20 PM',n:'Muckleshoot',g:'Fisher Stage',c:'Music'},
{d:'Sun',s:'4:25 PM',e:'5:05 PM',n:'Racing Mount Pleasant',g:'Fisher Stage',c:'Music'},
{d:'Sun',s:'4:30 PM',e:'5:00 PM',n:'Hannah Duckworth',g:'Upper NW Courtyard',c:'Music'},
{d:'Sun',s:'4:30 PM',e:'5:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sun',s:'4:55 PM',e:'6:15 PM',n:'Seattle Asian American Film Festival + Q&A',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sun',s:'5:00 PM',e:'5:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sun',s:'5:00 PM',e:'5:45 PM',n:'Goldie Boutilier',g:'Mural Stage',c:'Music'},
{d:'Sun',s:'5:05 PM',e:'5:25 PM',n:'CypherQueenz B-Girl + Julie Slick',g:'JUXT — Rooftop District',c:'Arts'},
{d:'Sun',s:'5:05 PM',e:'5:35 PM',n:'Vancouver Indigenous Fashion Week — "Earth"',g:'Fashion Runway',c:'Arts'},
{d:'Sun',s:'5:30 PM',e:'7:00 PM',n:'Best of Seattle',g:'Comedy Coop',c:'Arts'},
{d:'Sun',s:'5:30 PM',e:'8:30 PM',n:'Magician Travis Kim',g:'Magic Dome',c:'Arts'},
{d:'Sun',s:'5:30 PM',e:'6:30 PM',n:'Ride And Glide',g:'Gravity Park',c:'Arts'},
{d:'Sun',s:'5:35 PM',e:'6:15 PM',n:'ATARASHII GAKKO!',g:'Fisher Stage',c:'Music'},
{d:'Sun',s:'5:40 PM',e:'6:10 PM',n:'Morgan Paris Lanza',g:'Upper NW Courtyard',c:'Music'},
{d:'Sun',s:'6:00 PM',e:'6:30 PM',n:'Bellingham Buddies — Puppet Improv',g:'Puppet Playhouse',c:'Arts'},
{d:'Sun',s:'6:15 PM',e:'6:45 PM',n:'"Synthesized" by Tech Couture',g:'Fashion Runway',c:'Arts'},
{d:'Sun',s:'6:15 PM',e:'7:00 PM',n:'Noname — 10th Anniversary of "Telefone"',g:'Mural Stage',c:'Music'},
{d:'Sun',s:'6:20 PM',e:'6:40 PM',n:'Crystal Beth + Marissa Rae Niederhauser',g:'JUXT — Rooftop District',c:'Arts'},
{d:'Sun',s:'6:25 PM',e:'7:20 PM',n:'Three Dollar Bill Cinema',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sun',s:'6:30 PM',e:'7:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sun',s:'6:45 PM',e:'7:45 PM',n:'De La Soul',g:'Fisher Stage',c:'Music'},
{d:'Sun',s:'6:50 PM',e:'7:20 PM',n:'Lucha Luna',g:'Upper NW Courtyard',c:'Music'},
{d:'Sun',s:'7:00 PM',e:'8:00 PM',n:'35th North: RAMP RIOT!',g:'Gravity Park',c:'Arts'},
{d:'Sun',s:'7:00 PM',e:'7:30 PM',n:'Bellingham Buddies (PG-13)',g:'Puppet Playhouse',c:'Arts'},
{d:'Sun',s:'7:25 PM',e:'7:55 PM',n:'Prairie Underground — "Resistance Show"',g:'Fashion Runway',c:'Arts'},
{d:'Sun',s:'7:30 PM',e:'8:30 PM',n:'Comedy Coop Showdown by Laughs Comedy Club',g:'Comedy Coop',c:'Arts'},
{d:'Sun',s:'7:30 PM',e:'9:00 PM',n:'Seattle Film Society + Q&A',g:'VIDEORAMA: Northwest Shorts',c:'Arts'},
{d:'Sun',s:'7:45 PM',e:'8:45 PM',n:'Sudan Archives',g:'Mural Stage',c:'Music'},
{d:'Sun',s:'7:55 PM',e:'8:40 PM',n:'Daughters of Venus',g:'Upper NW Courtyard',c:'Music'},
{d:'Sun',s:'8:00 PM',e:'8:30 PM',n:'Bellingham Buddies (PG-13)',g:'Puppet Playhouse',c:'Arts'},
{d:'Sun',s:'8:00 PM',e:'10:00 PM',n:'SOS Pro Wrestling BUMBERMANIA!',g:'BUMBERMANIA!',c:'Arts'},
{d:'Sun',s:'8:15 PM',e:'9:30 PM',n:'Orville Peck',g:'Fisher Stage',c:'Music'},
{d:'Sun',s:'8:30 PM',e:'9:15 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sun',s:'8:40 PM',e:'9:40 PM',n:'Nobi and the Force',g:'Fashion Runway',c:'Arts'},
{d:'Sun',s:'9:30 PM',e:'10:00 PM',n:'Bellingham Buddies (R-Rated)',g:'Puppet Playhouse',c:'Arts'},
{d:'Sun',s:'9:30 PM',e:'11:00 PM',n:'Tokimonsta',g:'Mural Stage',c:'Music'},
{d:'Sun',s:'9:40 PM',e:'10:40 PM',n:'Suzzallo',g:'Upper NW Courtyard',c:'Music'},
{d:'Sun',s:'10:00 PM',e:'10:30 PM',n:'Una the Mermaid',g:'Una The Mermaid',c:'Arts'},
{d:'Sun',s:'10:15 PM',e:'11:30 PM',n:'Death Cab for Cutie',g:'Fisher Stage',c:'Music'},
];

/**
 * Drop-in-anytime entries, hand-flagged as `day|name|start`.
 *
 * These run for hours but nobody blocks out the whole window for them — you
 * wander into the cat circus or the magic dome when you have a gap. Deliberately
 * NOT flagged: the long Comedy Coop sets and the VIDEORAMA film blocks, which
 * really are scheduled programs you sit through.
 */
const FLEXIBLE_KEYS = new Set([
  "Sat|Motley Zoo Animal Rescue|12:30 PM",
  "Sat|The Lovejoysters + Levity Arts + Flatchestedmama|12:30 PM",
  "Sat|Taylor Kyle The American Mystifier|1:00 PM",
  "Sat|SOS Pro Wrestling BUMBERMANIA!|2:00 PM",
  "Sat|The Maritess Zurbano Magical Experience|5:00 PM",
  "Sat|SOS Pro Wrestling BUMBERMANIA!|8:00 PM",
  "Sun|Motley Zoo Animal Rescue|12:30 PM",
  "Sun|The Lovejoysters + Levity Arts + Flatchestedmama|12:30 PM",
  "Sun|Ruben Barron: Comedy Magic|1:30 PM",
  "Sun|SOS Pro Wrestling BUMBERMANIA!|2:00 PM",
  "Sun|Magician Travis Kim|5:30 PM",
  "Sun|SOS Pro Wrestling BUMBERMANIA!|8:00 PM",
]);

/** "7:30 PM" -> minutes since midnight. */
function parseMin(t) {
  const [time, ap] = t.trim().split(" ");
  let [h, m] = time.split(":").map(Number);
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/** Minutes since midnight -> "7:30 PM". */
function formatMin(min) {
  const wrapped = ((min % 1440) + 1440) % 1440;
  const h24 = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

/** Compact time for pasting into a message: "6:15p". */
function formatShort(min) {
  return formatMin(min).replace(":00", ":00").replace(" AM", "a").replace(" PM", "p");
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Normalized schedule: the shape the rest of the app works with. */
const SCHEDULE = RAW.map((r) => ({
  id: `${r.d.toLowerCase()}-${slugify(r.n)}-${parseMin(r.s)}`,
  day: r.d,
  name: r.n,
  stage: r.g,
  category: r.c,
  startMin: parseMin(r.s),
  endMin: parseMin(r.e),
  isFlexible: FLEXIBLE_KEYS.has(`${r.d}|${r.n}|${r.s}`),
})).sort((a, b) => a.startMin - b.startMin || a.name.localeCompare(b.name));

if (typeof module !== "undefined" && module.exports) {
  module.exports = { RAW, SCHEDULE, FLEXIBLE_KEYS, parseMin, formatMin, formatShort, slugify, stageOptions };
}

/**
 * Stages worth offering as a filter, split into real music stages and the arts
 * districts, each sorted.
 *
 * Bumbershoot's own data labels some one-act attractions as "stages" — Cat
 * Circus, Una The Mermaid, BUMBERMANIA! — where filtering by the stage is
 * identical to searching the act's name. Those are dropped from the list; they
 * are still reachable through search.
 */
function stageOptions(schedule) {
  const stages = new Map();
  for (const entry of schedule) {
    if (!stages.has(entry.stage)) stages.set(entry.stage, { acts: new Set(), music: 0, arts: 0 });
    const stage = stages.get(entry.stage);
    stage.acts.add(entry.name);
    if (entry.category === "Music") stage.music++;
    else stage.arts++;
  }
  const music = [];
  const arts = [];
  for (const [name, stage] of stages) {
    if (stage.acts.size < 2) continue;
    (stage.music >= stage.arts ? music : arts).push(name);
  }
  const byName = (a, b) => a.localeCompare(b);
  return { music: music.sort(byName), arts: arts.sort(byName) };
}
