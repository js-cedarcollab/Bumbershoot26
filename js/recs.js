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
  // ---- Music, Saturday & Sunday (one entry per act) ----
  { name: "ANTHERS", star: true, local: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Megan Seling", blurb: "If you loved long-defunct Seattle punk rock noise makers pleasureboaters, go see ANTHERS and party like you’re at Healthy Times Fun Club circa 2008." },
  { name: "Aryana León", local: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Rob Moura", blurb: "She’s flourishing as a pop/R&B artist on the rise… Her voice is incredible, warm currents over songs that play like smooth passenger-side car rides by the bay." },
  { name: "Bexley", local: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Sam Machkovech", blurb: "Bexley keeps that spirit alive by fusing overdriven, heavy riffs, soulful wails over guitar solos, and a Zeppelin/Sabbath foundation of ’70s rock." },
  { name: "Bikini Kill", star: true, local: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Audrey Vann", blurb: "The Olympia feminist punk band is the reason I went to Evergreen State College… their early ’90s songs were still just as fresh, jolting, and resonant as they were two decades before." },
  { name: "Blood Orange", star: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Julianne Bell", blurb: "The lush, dreamy ’80s R&B- and funk-influenced songs soundtracked a sun-soaked summer in my 20s… I just know that his Bumbershoot set is going to heal me." },
  { name: "Cain Culto", star: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Rachel Stevens", blurb: "Cain Culto raps, sings, and plays electric violin while dancing like you’re on the floor at your favorite gay bar." },
  { name: "Chase & Status", url: STRANGER_SOURCES.Music.Sat,
    author: "Megan Seling", blurb: "London-based DJs Chase & Status will close out Saturday night with what’s sure to devolve into a dizzying drum ’n’ bass dance party." },
  { name: "Die Spitz", url: STRANGER_SOURCES.Music.Sat,
    author: "Rob Moura", blurb: "The band’s all-femme roster would trade vocal leads and put out punk so incendiary it would damn near burn the venue down." },
  { name: "Joey Valence & Brae", url: STRANGER_SOURCES.Music.Sat,
    author: "Megan Seling", blurb: "Their chaotic punk-laced hip-hop tracks sound less like a rip-off and more like a whole-hearted celebration of all the musicians who inspired them to pick up a mic." },
  { name: "Juliet Daniel", local: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Rachel Stevens", blurb: "Ever wonder what quitting your tech job at Microsoft to make bedroom pop would sound like? It sounds like Juliet Daniel, because that’s what this hero did." },
  { name: "Lucy Dacus", star: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Julianne Bell", blurb: "With her introspective, storytelling lyrics and her impressive Goodreads profile, she’s truly a writer’s musician." },
  { name: "Meat Hair", local: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Megan Seling", blurb: "If you love local Sub Pop darlings Deep Sea Diver (and who doesn’t?), then definitely don’t miss Meat Hair, an experimental jam band in which members of DSD get real weird." },
  { name: "Molchat Doma", url: STRANGER_SOURCES.Music.Sat,
    author: "Sam Machkovech", blurb: "Dark-wave trio Molchat Doma bang out shimmering-yet-devilish techno that sprinkles Gregorian chant into New Order’s formula. Don a trench coat and dance darkly." },
  { name: "Oblé Reed", star: true, local: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Rob Moura", blurb: "The 24-year-old artist is near the top of the most notable rappers to spawn from our waterlogged loam this decade… you owe it to yourself to see the man work a crowd." },
  { name: "Peaches", star: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Audrey Vann", blurb: "It’s 2026, and we need Peaches’ sexually transgressive electroclash hip-hop more than ever." },
  { name: "Pixel Grip", url: STRANGER_SOURCES.Music.Sat,
    author: "Sam Machkovech", blurb: "A tighter, gayer, and synthier version of Yeah Yeah Yeahs… their chunky, brzzt-brzzt Moog-synth jams may be worth slapping on your favorite sunglasses for." },
  { name: "Sera Cahoone", star: true, local: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Rachel Stevens", blurb: "It’s been 14 years… since Sera Cahoone has played Bumbershoot! If you don’t yet know the magic of her blues meets folk meets country, it’s never too late to pull up a chair." },
  { name: "Silvana Estrada", url: STRANGER_SOURCES.Music.Sat,
    author: "Audrey Vann", blurb: "Combines the sparse acoustic guitars and romantic poetry of South American folk revivalists with the vocal chops of American jazz icons. (For fans of Joan Baez, Angel Olsen, and crying at concerts.)" },
  { name: "Travis Thompson", star: true, local: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Charles Mudede", blurb: "The gifted Burien rapper… also dropped the NW hip-hop classic “Need You.” Whatever you do, do not sleep on this cat." },
  { name: "Turnstile", star: true, url: STRANGER_SOURCES.Music.Sat,
    author: "Julianne Bell", blurb: "They’re especially known for their high-octane, mosh-heavy performances, which many fans describe as life-changing." },
  { name: "XCOMM", url: STRANGER_SOURCES.Music.Sat,
    author: "Megan Seling", blurb: "Their blistering skate punk is thrashy, fast, and injected with some nu-metal guitar wailing… And yes, the drummer is like 14. Get over it." },
  { name: "American Flats", local: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Megan Seling", blurb: "It’s not revelatory, it’s not perfect, but it’s a warm hug if you’re longing for those days of seeing Tom Petty at the Gorge every summer." },
  { name: "ATARASHII GAKKO!", url: STRANGER_SOURCES.Music.Sun,
    author: "Megan Seling", blurb: "If you love J-pop, synchronized dancing, matching outfits, and songs about burnout culture, you’re gonna love Atarashii Gakko!" },
  { name: "Daughters of Venus", local: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Megan Seling", blurb: "A Seattle-based “alternative rock girl band” (their words), play music that could be the soundtrack for a dramatic reveal during an episode of Pretty Little Liars. I mean that as a compliment." },
  { name: "De La Soul", star: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Charles Mudede", blurb: "It’s hard to really capture the wonder of De La Soul’s debut album, 3 Feet High and Rising… a trio that completely changed the game." },
  { name: "Death Cab for Cutie", star: true, local: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Charles Mudede", blurb: "Let’s talk about their tune “Soul Meets Body”… my soul is moved by the sensations my body experiences while listening to this tune." },
  { name: "Goldie Boutilier", url: STRANGER_SOURCES.Music.Sun,
    author: "Rachel Stevens", blurb: "Her music is a combination of chill disco, ’70s glam rock, and alt-country… it hearkens back to a time where you heard new music in a smoky dive bar." },
  { name: "Hannah Duckworth", local: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Rachel Stevens", blurb: "This Seattle singer-songwriter-rocker plays music that makes us remember how much we love pop-punk of yore. Expect everything from acoustic solo guitar strumming to a beginner-friendly mosh pit." },
  { name: "Lucha Luna", star: true, local: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Rob Moura", blurb: "Vazquez recontextualizes her other band’s punk energy through Arndt’s dense beats, creating a compelling fusion of rhythm and rage. One of the freshest acts on this year’s lineup." },
  { name: "Midpak", star: true, local: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Dave Segal", blurb: "Within Seattle’s robust funk scene, Midpak are the hungry young guns on the rise… I’ve seen them play 12 times and they never fail to whip folks into a frenzy." },
  { name: "Morgan Paris Lanza", local: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Rachel Stevens", blurb: "A sultry combination of lounge singing and burlesque that sounds like jazz, R&B, and smooth pop, exploring love, loss, and transformation through a vintage filter." },
  { name: "Noname — 10th Anniversary of \"Telefone\"", star: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Audrey Vann", blurb: "Ten years later, listening to Telefone still feels like catching up with an old friend." },
  { name: "Orville Peck", url: STRANGER_SOURCES.Music.Sun,
    author: "Rob Moura", blurb: "Nobody’s doing it like Orville Peck… expect Peck to run through cuts off his newest equinely titled record, and expect to live, as always, for all of it." },
  { name: "PawPaw Rod", url: STRANGER_SOURCES.Music.Sun,
    author: "Megan Seling", blurb: "PawPaw Rod’s music is medicinal. It cures what ails you. His posi-soul R&B jams will lift you out of a rut and soften your sharp edges." },
  { name: "Racing Mount Pleasant", star: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Megan Seling", blurb: "A seven-piece indie rock orchestra from Ann Arbor… Their songs shift from whisper-quiet to explosions of horns and strings and harmonies. Goosebumps." },
  { name: "Sextile", star: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Dave Segal", blurb: "Sextile’s music exists at the intersection where agitational post-punk collides with sleazy EBM… their newest album abounds with sweaty and brazen bangers." },
  { name: "Sudan Archives", star: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Todd Hamm", blurb: "Neck-snapping Low End Theory beats, heart-stuttering tech-house rhythms, glossy Beyoncé-pop, warm sun spots of neo-soul… punctuated by her sweeping vocals." },
  { name: "Suzzallo", star: true, local: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Megan Seling", blurb: "If you like the Sunny Day Real Estate songs where Jeremy Enigk is especially pissed off, you’re gonna love Suzzallo’s ear-pummeling, guitar-driven rock songs." },
  { name: "Takuya Nakamura", star: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Dave Segal", blurb: "Not your typical electronic-music producer — the trumpeter and keyboardist has done sessions with Quincy Jones, David Byrne, Lee “Scratch” Perry, the GZA, and many other notables." },
  { name: "Tokimonsta", url: STRANGER_SOURCES.Music.Sun,
    author: "Todd Hamm", blurb: "Her sets, like her albums, have an impressive range of styles represented… The variety of moods and counterpunches make for blissful ebbs and flows whenever she hits the stage." },
  { name: "W.I.T.C.H.", star: true, url: STRANGER_SOURCES.Music.Sun,
    author: "Dave Segal", blurb: "The standard-bearers of Zamrock… have reunited, cut new music, and continued to tour, with shocking creative vitality." },

  // ---- Arts districts (apply to every set on that stage) ----
  { name: "BUMBERMANIA!", stage: true, url: STRANGER_SOURCES.Arts,
    author: "Megan Seling", blurb: "Local wrestling crew SOS Wrestling builds a real-deal ring in the middle of the Seattle Center… It’s so fun, so captivating, that I missed part of Janelle Monáe’s headlining set last year because I couldn’t look away." },
  { name: "Cat Circus", stage: true, url: STRANGER_SOURCES.Arts,
    author: "Megan Seling", blurb: "It is my journalistic duty to set the record straight: The cats do not do tricks. There are no performances… But lines are long at the Cat Circus that’s not really a circus. You’ve been warned." },
  { name: "Comedy Coop", stage: true, star: true, url: STRANGER_SOURCES.Arts,
    author: "Sam Machkovech", blurb: "This year’s comedy options will likely merit their own lengthy queues. Budget your between-bands comedy time accordingly." },
  { name: "Fashion Runway", stage: true, star: true, url: STRANGER_SOURCES.Arts,
    author: "Julianne Bell", blurb: "Bumbershoot’s Fashion District is a chance for the city’s few sartorial specialists to flaunt their style bona fides on the runway." },
  { name: "Free Range Performances", stage: true, url: STRANGER_SOURCES.Arts,
    author: "Megan Seling", blurb: "Folks like the Rat City Roller Derby skaters and conceptual artist Flatchestedmama pop up around the Seattle Center and do what exactly? And when? Who knows! The mystery is what makes it fun, maybe!" },
  { name: "Gravity Park", stage: true, url: STRANGER_SOURCES.Arts,
    author: "Megan Seling", blurb: "You’ll feel like it’s X-Games circa 1997, where you can catch skateboard and BMX competitions and demos. Also returning: 35th North’s Ramp Riot, where the best tricks can win skaters cash prizes!" },
  { name: "Magic Dome", stage: true, url: STRANGER_SOURCES.Arts,
    author: "Sam Machkovech", blurb: "Bumbershoot’s new Magic Dome isn’t quite the star-studded selection of modern, likable magicians that we were hoping for… But Taylor Kyle is a legit close-up magician, and his tricks do blow minds." },
  { name: "Puppet Playhouse", stage: true, url: STRANGER_SOURCES.Arts,
    author: "Megan Seling", blurb: "It’s Ryan Stiles’s Upfront Theatre that’s hosting the Puppet Playhouse, which will present both kid-friendly and 18-plus puppet shows." },
  { name: "Rooftop District", stage: true, star: true, url: STRANGER_SOURCES.Arts,
    author: "Amanda Manitach", blurb: "If you need a break from the crush below, the rooftop is the place to be: a perch overlooking the Main Stage, a glass of wine in hand, and intimate performances… do not miss atm/overdraft." },
  { name: "Una the Mermaid", stage: true, url: STRANGER_SOURCES.Arts,
    author: "Julianne Bell", blurb: "Hawaiian-born, Portland-based underwater artist Una the Mermaid will swim in a 900-gallon gilded glass aquarium, shimmering tail and all." },
  { name: "VIDEORAMA: Northwest Shorts", stage: true, url: STRANGER_SOURCES.Arts,
    author: "Sam Machkovech", blurb: "Curated by longtime local org Seattle Film Society… we vote for the 48 Hour Film Fest, since it requires participating filmmakers to make short films with creative and timing constraints." },
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
 * Attach recs to schedule entries.
 *
 * A rec with `stage: true` names one of the arts districts and applies to every
 * set on that stage; everything else names an act. Returns { byId, unmatched } —
 * `unmatched` lists recs that found nothing, which is the only way to catch a
 * typo or an act that left the lineup, so the caller should surface it rather
 * than swallow it.
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

  const stages = new Map();
  for (const entry of schedule) {
    const key = recKey(entry.stage);
    if (!stages.has(key)) stages.set(key, []);
    stages.get(key).push(entry);
  }

  const byId = new Map();
  const unmatched = [];
  // Acts first, districts second, so a set keeps its own rec over the blanket
  // one for the stage it happens to be on.
  const ordered = [...recs.filter((r) => !r.stage), ...recs.filter((r) => r.stage)];
  for (const rec of ordered) {
    const key = recKey(rec.name);
    let matches;
    if (rec.stage) {
      // "Rooftop District" should still find "JUXT — Rooftop District".
      matches = stages.get(key);
      if (!matches) {
        const near = [...stages.entries()].filter(([k]) => k.includes(key));
        matches = near.length === 1 ? near[0][1] : undefined;
      }
    } else {
      matches = byKey.get(key) || byTight.get(tightKey(rec.name));
    }
    if (!matches) {
      unmatched.push(rec.name);
      continue;
    }
    // One rec covers every set that act plays — the arts acts recur all weekend.
    for (const entry of matches) {
      // An act's own rec beats the blanket rec for the district it plays in.
      if (rec.stage && byId.has(entry.id)) continue;
      byId.set(entry.id, {
        star: !!rec.star,
        local: !!rec.local,
        blurb: rec.blurb || "",
        author: rec.author || "",
        url: rec.url || "",
        stage: !!rec.stage,
      });
    }
  }
  return { byId, unmatched };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { STRANGER_RECS, STRANGER_SOURCES, recKey, tightKey, matchRecs };
}
