import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import type { InsertTrack } from "@shared/schema";
import * as https from "https";
import * as http from "http";

// Corrected, deduplicated seed tracks — most recent post per thread
const SEED_TRACKS: InsertTrack[] = [
  {
    songTitle: "JWM\u2019s November 2026 Music Journal",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://www.youtube.com/watch?v=1-UK2fTgvfg",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70142/jwm-s-november-2026-music-journal",
    embedCode: "https://www.youtube.com/embed/1-UK2fTgvfg",
    fetchedAt: "2026-11-10T02:49:40+00:00",
  },
  {
    songTitle: "The iOS \u201cGarageband Only\u201d Challenge",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/VqF1BckZsEOlidKiSG",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70234/the-ios-garageband-only-challenge",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-morning-sunshine%3Fsi%3D4c65188098134fce98121e3d8e4f9661%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-11-09T16:20:02+00:00",
  },
  {
    songTitle: "CountersINK",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://on.soundcloud.com/ZaLXCgi06RqWu6Wg8Q",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70225/countersink",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fgeotony%2F387-countersink%3Futm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing%26si%3Df6f6d8fe0c33494e9c35b017917c762b&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-11-08T21:51:27+00:00",
  },
  {
    songTitle: "New ambient- and jazzlike EP Cairo",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/cairo",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/70223/new-ambient-and-jazzlike-ep-cairo",
    embedCode: "https://app.hearthis.at/embed/14758583/transparent_black/?",
    fetchedAt: "2026-11-08T20:06:04+00:00",
  },
  {
    songTitle: "A Vorta  venture: Dark Patterns",
    artistName: "Svetlovska",
    forumMember: "Svetlovska",
    mediaUrl: "https://soundcloud.com/irena-svetlovska/dark-patterns?si=bcfdd3cad5f543d1bdca90c0c3202286",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70215/a-vorta-venture-dark-patterns",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/irena-svetlovska/dark-patterns?si=bcfdd3cad5f543d1bdca90c0c3202286&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-11-08T11:56:11+00:00",
  },
  {
    songTitle: "Into the Night (Solo, Velvet Guitar, Noire, Continua)",
    artistName: "DavidEnglish",
    forumMember: "DavidEnglish",
    mediaUrl: "https://www.youtube.com/watch?v=yij_H5gdwYo",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70204/into-the-night-solo-velvet-guitar-noire-continua",
    embedCode: "https://www.youtube.com/embed/yij_H5gdwYo",
    fetchedAt: "2026-11-07T17:50:35+00:00",
  },
  {
    songTitle: "Let It Take Control",
    artistName: "Paulieworld",
    forumMember: "Paulieworld",
    mediaUrl: "https://soundcloud.com/paulieworld/let-it-take-control",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70187/let-it-take-control",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/paulieworld/let-it-take-control&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-11-06T18:04:38+00:00",
  },
  {
    songTitle: "Das Boot iPad cover",
    artistName: "DMfan",
    forumMember: "DMfan",
    mediaUrl: "https://www.youtube.com/watch?v=JAO8ogal-U0",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70186/das-boot-ipad-cover",
    embedCode: "https://www.youtube.com/embed/JAO8ogal-U0",
    fetchedAt: "2026-11-06T17:02:00+00:00",
  },
  {
    songTitle: "Take two: An Impulsive Impulsedie implosion - Antigod",
    artistName: "Svetlovska",
    forumMember: "Svetlovska",
    mediaUrl: "https://www.youtube.com/watch?v=iKF9qIrmhpA",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70183/take-two-an-impulsive-impulsedie-implosion-antigod",
    embedCode: "https://www.youtube.com/embed/iKF9qIrmhpA",
    fetchedAt: "2026-11-06T15:15:29+00:00",
  },
  {
    songTitle: "Architect",
    artistName: "barabajagal",
    forumMember: "barabajagal",
    mediaUrl: "https://soundcloud.com/barabajagal74/architect",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70182/architect",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/barabajagal74/architect&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-11-06T11:27:44+00:00",
  },
  {
    songTitle: "New Track Out Today: Groove Nebula (Space Jazz ;) )",
    artistName: "Mojotele65",
    forumMember: "Mojotele65",
    mediaUrl: "https://www.youtube.com/watch?v=4Q8axmPx4nQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70180/new-track-out-today-groove-nebula-space-jazz",
    embedCode: "https://www.youtube.com/embed/4Q8axmPx4nQ",
    fetchedAt: "2026-11-06T02:15:48+00:00",
  },
  {
    songTitle: "Enchanted",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://on.soundcloud.com/vO68JQ3QhZrYCzDl0Q",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70177/enchanted",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fgeotony%2F386-enchanted%3Futm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing%26si%3D3d2d5e0d37224940a3cf6f5a30bde403&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-11-05T21:18:02+00:00",
  },
  {
    songTitle: "\"Vernal Rain of Melancholy\" + \"Secret place\" (Cinematic Synth)",
    artistName: "dakti",
    forumMember: "dakti",
    mediaUrl: "https://soundcloud.com/dakti/secret-place",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70175/vernal-rain-of-melancholy-secret-place-cinematic-synth",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/dakti/secret-place&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-11-05T19:25:51+00:00",
  },
  {
    songTitle: "Mostly Exosphere",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=scndYsvLd7U",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70158/mostly-exosphere",
    embedCode: "https://www.youtube.com/embed/scndYsvLd7U",
    fetchedAt: "2026-11-04T19:15:14+00:00",
  },
  {
    songTitle: "Sauna Zoot",
    artistName: "Yadrichik_Chaya",
    forumMember: "Yadrichik_Chaya",
    mediaUrl: "https://www.youtube.com/watch?v=xHymCW508fM",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70156/sauna-zoot",
    embedCode: "https://www.youtube.com/embed/xHymCW508fM",
    fetchedAt: "2026-11-04T16:14:25+00:00",
  },
  {
    songTitle: "Pavane for a dead squirrel",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://on.soundcloud.com/rAJ3Al6mjRihha4bVz",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70148/pavane-for-a-dead-squirrel",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fgeotony%2F385-pavane-for-a-dead-squirrel%3Futm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing%26si%3D11ed90f40537455da94738dc6a0e3e52&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-11-03T19:58:29+00:00",
  },
  {
    songTitle: "Phase Value - Melodic DnB / Drumstep in Drambo",
    artistName: "endlessdisarray",
    forumMember: "endlessdisarray",
    mediaUrl: "https://www.youtube.com/watch?v=j4jc_ZWucX8",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70146/phase-value-melodic-dnb-drumstep-in-drambo",
    embedCode: "https://www.youtube.com/embed/j4jc_ZWucX8",
    fetchedAt: "2026-11-03T18:54:55+00:00",
  },
  {
    songTitle: "Little droney jam with irio plex (beta).",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=vbgmit3_QIQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70145/little-droney-jam-with-irio-plex-beta",
    embedCode: "https://www.youtube.com/embed/vbgmit3_QIQ",
    fetchedAt: "2026-11-03T18:40:40+00:00",
  },
  {
    songTitle: "Help the Hitman",
    artistName: "Dominion_Harmonics",
    forumMember: "Dominion_Harmonics",
    mediaUrl: "https://www.youtube.com/watch?v=aTrNtrIQVdo",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70140/help-the-hitman",
    embedCode: "https://www.youtube.com/embed/aTrNtrIQVdo",
    fetchedAt: "2026-11-03T01:18:33+00:00",
  },
  {
    songTitle: "JWM - I\u2019m More Than Faithful (Inst Love Ballad in Garageband)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/f59je2cwcMBECDRpSh",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70136/jwm-i-m-more-than-faithful-inst-love-ballad-in-garageband",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-im-more-than-faithful%3Fsi%3D9878926f20124402a5a29b893b1be370%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-11-02T20:46:35+00:00",
  },
  {
    songTitle: "Convergence is a new song from the upcoming EP Crossroads",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/convergence",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/70124/convergence-is-a-new-song-from-the-upcoming-ep-crossroads",
    embedCode: "https://app.hearthis.at/embed/14749806/transparent_black/?",
    fetchedAt: "2026-11-01T21:27:06+00:00",
  },
  {
    songTitle: "JWM - Morning Sunrise (Slow EDM meets World Music in Garageband)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/RsxdBwoPwklFqwYMJ4",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70121/jwm-morning-sunrise-slow-edm-meets-world-music-in-garageband",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-morning-sunrise%3Fsi%3Df068a7efde124fa796fce347000fa98d%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-11-01T18:39:33+00:00",
  },
  {
    songTitle: "Slow Down",
    artistName: "Anjaleax",
    forumMember: "Anjaleax",
    mediaUrl: "https://on.soundcloud.com/QpwPFRBlGqG8nChTo9",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70109/slow-down",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fanjalea-ayres-36132956%2Fslow-down%3Fref%3Dclipboard%26p%3Di%26c%3D1%26si%3D8DCD94AFFFCE4139A0D47001CDCFB2F4%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-31T18:48:24+00:00",
  },
  {
    songTitle: "Hollow Knoll - Dark Ambient exploration with HollowTone et al.",
    artistName: "id_23",
    forumMember: "id_23",
    mediaUrl: "https://www.youtube.com/watch?v=vA9AG1JnWpk",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70105/hollow-knoll-dark-ambient-exploration-with-hollowtone-et-al",
    embedCode: "https://www.youtube.com/embed/vA9AG1JnWpk",
    fetchedAt: "2026-10-31T12:50:30+00:00",
  },
  {
    songTitle: "Audio Samples Monthly Pack 68",
    artistName: "zvon",
    forumMember: "zvon",
    mediaUrl: "https://www.youtube.com/watch?v=FUirBwJrII0",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70099/audio-samples-monthly-pack-68",
    embedCode: "https://www.youtube.com/embed/FUirBwJrII0",
    fetchedAt: "2026-10-30T20:30:23+00:00",
  },
  {
    songTitle: "JWM - 2008 Pop Song Beat 103026 (Pop Inst in GB)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://www.youtube.com/watch?v=-4XOT14Ku94",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70094/jwm-2008-pop-song-beat-103026-pop-inst-in-gb",
    embedCode: "https://www.youtube.com/embed/-4XOT14Ku94",
    fetchedAt: "2026-10-30T16:47:02+00:00",
  },
  {
    songTitle: "Irio pro pitch transposer demo.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=DsRdt4JIuMQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70088/irio-pro-pitch-transposer-demo",
    embedCode: "https://www.youtube.com/embed/DsRdt4JIuMQ",
    fetchedAt: "2026-10-30T11:30:42+00:00",
  },
  {
    songTitle: "M-Vave Madness! : The Harbinger",
    artistName: "Svetlovska",
    forumMember: "Svetlovska",
    mediaUrl: "https://soundcloud.com/irena-svetlovska/harbinger?si=72b310cfd37c43b1b577a778358c075d",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70086/m-vave-madness-the-harbinger",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/irena-svetlovska/harbinger?si=72b310cfd37c43b1b577a778358c075d&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-10-30T11:10:41+00:00",
  },
  {
    songTitle: "Monk",
    artistName: "boomer",
    forumMember: "boomer",
    mediaUrl: "https://www.youtube.com/watch?v=VKzWLUQizz8",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70085/monk",
    embedCode: "https://www.youtube.com/embed/VKzWLUQizz8",
    fetchedAt: "2026-10-30T06:05:24+00:00",
  },
  {
    songTitle: "JWM - Golden Hour (Nu Disco in Gadget)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/CmHwNRVH1cUEhe9Afv",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70081/jwm-golden-hour-nu-disco-in-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-golden-hour%3Fsi%3Df21e9ee66d164210b12e422419e6a799%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-29T17:23:38+00:00",
  },
  {
    songTitle: "The Wagtunes Corner",
    artistName: "wagtunes",
    forumMember: "wagtunes",
    mediaUrl: "https://soundcloud.com/steven-wagenheim/sets/pop-jazz-and-his-orchestra",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/66861/the-wagtunes-corner",
    embedCode: "https://w.soundcloud.com/player/?url=https://soundcloud.com/steven-wagenheim/sets/pop-jazz-and-his-orchestra&color=ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-29T14:07:37+00:00",
  },
  {
    songTitle: "Dominion Harmonics - Pusher",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/G7tMeMMgGShL5vYd1w",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70063/dominion-harmonics-pusher",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fdominion-harmonics%2Fthe-pusher%3Fsi%3Db3792a1dc0da4756b4a3675e9d07f9c3%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-27T17:22:02+00:00",
  },
  {
    songTitle: "iM1 Challenge",
    artistName: "Paulieworld",
    forumMember: "Paulieworld",
    mediaUrl: "https://soundcloud.com/toin00z/im1-challenge-05-11-2026",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70062/im1-challenge",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/toin00z/im1-challenge-05-11-2026&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-10-27T17:12:27+00:00",
  },
  {
    songTitle: "My first lofi song made on GarageBand",
    artistName: "Anjaleax",
    forumMember: "Anjaleax",
    mediaUrl: "https://on.soundcloud.com/CSM3rYz5FAOgIlGYmj",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70061/my-first-lofi-song-made-on-garageband",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fanjalea-ayres-36132956%2Flo-fi-chill-vibes%3Fref%3Dclipboard%26p%3Di%26c%3D1%26si%3D1562FF164B4F4E5F91B2FDF06D18B178%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-27T17:04:37+00:00",
  },
  {
    songTitle: "Irio pro plata module demo.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=zwAZoFK8xgg",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70042/irio-pro-plata-module-demo",
    embedCode: "https://www.youtube.com/embed/zwAZoFK8xgg",
    fetchedAt: "2026-10-26T12:26:48+00:00",
  },
  {
    songTitle: "New EP, Static Rebellion",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/static-rebellion",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/70041/new-ep-static-rebellion",
    embedCode: "https://app.hearthis.at/embed/14740724/transparent_black/?",
    fetchedAt: "2026-10-26T11:59:44+00:00",
  },
  {
    songTitle: "Time and Tide",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://www.youtube.com/watch?v=WIpwHbtQhG8",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70036/time-and-tide",
    embedCode: "https://www.youtube.com/embed/WIpwHbtQhG8",
    fetchedAt: "2026-10-25T17:46:10+00:00",
  },
  {
    songTitle: "JWM - The Somber Sunrise (TripHop Inspired by BoC and Yanni)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/sZmwOhz7CcMM3zo7qm",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70035/jwm-the-somber-sunrise-triphop-inspired-by-boc-and-yanni",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-the-somber-sunrise%3Fsi%3D9ebf922168d9496aaed7dd5ff2b5798d%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-25T17:18:49+00:00",
  },
  {
    songTitle: "Audio Damage's Replicant is pretty awesome",
    artistName: "kyrillik",
    forumMember: "kyrillik",
    mediaUrl: "https://www.youtube.com/watch?v=dbTc6T5D_WA",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70030/audio-damages-replicant-is-pretty-awesome",
    embedCode: "https://www.youtube.com/embed/dbTc6T5D_WA",
    fetchedAt: "2026-10-25T09:37:31+00:00",
  },
  {
    songTitle: "The \u201ciM1 or M1 vst or M1 hardware Only\u201d Music Challenge",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/vAkOX7zOnxnA5DW35U",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70025/the-im1-or-m1-vst-or-m1-hardware-only-music-challenge",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-the-funky-beat%3Fsi%3D7c56d835e5314289a85513a71a219434%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-25T02:18:33+00:00",
  },
  {
    songTitle: "JWM - Fond Childhood Memories (A \u201cno drums\u201d Yanni-inspired piece in Garageband)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/CJ4N00lMZ5I78tBROQ",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70021/jwm-fond-childhood-memories-a-no-drums-yanni-inspired-piece-in-garageband",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-fond-childhood-memories%3Fsi%3D83fe445d722440f69fc0c12c6ec0f9af%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-24T20:51:58+00:00",
  },
  {
    songTitle: "Down Deep (Intimate Cello, Noire, Continua)",
    artistName: "DavidEnglish",
    forumMember: "DavidEnglish",
    mediaUrl: "https://www.youtube.com/watch?v=qKmSfiS-lfI",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70018/down-deep-intimate-cello-noire-continua",
    embedCode: "https://www.youtube.com/embed/qKmSfiS-lfI",
    fetchedAt: "2026-10-24T17:27:44+00:00",
  },
  {
    songTitle: "\"Enigma\" + \"African breeze\" (Cinematic Synth)",
    artistName: "dakti",
    forumMember: "dakti",
    mediaUrl: "https://soundcloud.com/dakti/enigma",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/70015/enigma-african-breeze-cinematic-synth",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/dakti/enigma&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-10-24T12:24:55+00:00",
  },
  {
    songTitle: "New Track Out today: Blade Runner meets Escape from New York",
    artistName: "Mojotele65",
    forumMember: "Mojotele65",
    mediaUrl: "https://www.youtube.com/watch?v=x6Wa7DIPEI4",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/70000/new-track-out-today-blade-runner-meets-escape-from-new-york",
    embedCode: "https://www.youtube.com/embed/x6Wa7DIPEI4",
    fetchedAt: "2026-10-23T10:11:17+00:00",
  },
  {
    songTitle: "The man with the harmonica.Guitar cover.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=YLuh99j4nkk",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/69992/the-man-with-the-harmonica-guitar-cover",
    embedCode: "https://www.youtube.com/embed/YLuh99j4nkk",
    fetchedAt: "2026-10-22T15:02:23+00:00",
  },
  {
    songTitle: "JWM - Moonlight on the Floor (Revisited)(Nu Disco in Garageband)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/eG3L0UVGC4yBPlwmST",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/69967/jwm-moonlight-on-the-floor-revisited-nu-disco-in-garageband",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-moonlight-on-the-floor-1%3Fsi%3D74d9a0e21ed7448cae117fed1162ddf6%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-20T17:23:27+00:00",
  },
  {
    songTitle: "Spooky drum and bass in drambo",
    artistName: "Senyor_F",
    forumMember: "Senyor_F",
    mediaUrl: "https://on.soundcloud.com/KvrKOTfW5v3qEk2GA2",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/69961/spooky-drum-and-bass-in-drambo",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fsenyor_f%2Fspook-and-bass%3Fref%3Dclipboard%26p%3Di%26c%3D1%26si%3D3817EDE29C4445E9A1F828AE36BB7283%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-10-19T21:14:17+00:00",
  },
  {
    songTitle: "A Svetlovska - rottencat collaboration",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=7sbcWJTu3OI",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/69930/a-svetlovska-rottencat-collaboration",
    embedCode: "https://www.youtube.com/embed/7sbcWJTu3OI",
    fetchedAt: "2026-10-17T00:22:20+00:00",
  },
  {
    songTitle: "new track with loopy - A Breath Between Worlds",
    artistName: "guitarhero07",
    forumMember: "guitarhero07",
    mediaUrl: "https://soundcloud.com/digitalfungi/a-breath-between-worlds",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/69904/new-track-with-loopy-a-breath-between-worlds",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/digitalfungi/a-breath-between-worlds&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-10-14T20:42:38+00:00",
  },
  {
    songTitle: "a couple of VGM inspired beats",
    artistName: "MJKLZ",
    forumMember: "MJKLZ",
    mediaUrl: "https://www.youtube.com/watch?v=Ax0EJwmDnkc",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/69898/a-couple-of-vgm-inspired-beats",
    embedCode: "https://www.youtube.com/embed/Ax0EJwmDnkc",
    fetchedAt: "2026-10-14T11:38:21+00:00",
  },
  {
    songTitle: "Alpaca",
    artistName: "Dominion_Harmonics",
    forumMember: "Dominion_Harmonics",
    mediaUrl: "https://soundcloud.com/dominion-harmonics/alpaca?si=58a00b2a425c4f5281114092cc8c976f",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/69886/alpaca",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/dominion-harmonics/alpaca?si=58a00b2a425c4f5281114092cc8c976f&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-10-13T15:22:17+00:00",
  },
  {
    songTitle: "Irio pro offramp demo",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=7TdsdzHKZDk",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/69884/irio-pro-offramp-demo",
    embedCode: "https://www.youtube.com/embed/7TdsdzHKZDk",
    fetchedAt: "2026-10-13T14:18:02+00:00",
  },
  {
    songTitle: "Wagdog\u2019s First GB creation",
    artistName: "wagdog",
    forumMember: "wagdog",
    mediaUrl: "https://soundcloud.com/wagdog-1/wagtunemaster",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/69869/wagdog-s-first-gb-creation",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/wagdog-1/wagtunemaster&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-10-12T13:39:35+00:00",
  },
  {
    songTitle: "Purple and Blackmore tribute.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=1HUOtgmP8SY",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/69861/purple-and-blackmore-tribute",
    embedCode: "https://www.youtube.com/embed/1HUOtgmP8SY",
    fetchedAt: "2026-10-11T20:24:46+00:00",
  },
  {
    songTitle: "Drambo song inspired by wallace & gromit",
    artistName: "Senyor_F",
    forumMember: "Senyor_F",
    mediaUrl: "https://on.soundcloud.com/Rx6FaRDOQw0XN7piXh",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/69728/drambo-song-inspired-by-wallace-gromit",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fsenyor_f%2Flove-hugs-from-the-west%3Fref%3Dclipboard%26p%3Di%26c%3D1%26si%3D1A38ED4CDD914EC99BFB0F258D6EE1F0%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-09-26T14:14:46+00:00",
  },
  {
    songTitle: "Fractal galaxy dust - ambient looping with circa etc",
    artistName: "id_23",
    forumMember: "id_23",
    mediaUrl: "https://www.youtube.com/watch?v=wVRWnPQQ9sc",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/69516/fractal-galaxy-dust-ambient-looping-with-circa-etc",
    embedCode: "https://www.youtube.com/embed/wVRWnPQQ9sc",
    fetchedAt: "2026-09-06T09:18:17+00:00",
  },
  {
    songTitle: "Music and Action for Peace!",
    artistName: "zvon",
    forumMember: "zvon",
    mediaUrl: "https://www.youtube.com/watch?v=sm88ePdaqro",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68100/music-and-action-for-peace",
    embedCode: "https://www.youtube.com/embed/sm88ePdaqro",
    fetchedAt: "2026-04-08T20:50:10+00:00",
  },
  {
    songTitle: "October update: lukesleepwalker\u2019s 2026 resolution: a track a month",
    artistName: "lukesleepwalker",
    forumMember: "lukesleepwalker",
    mediaUrl: "https://soundcloud.com/lukesleepwalker-1/october-wav",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/67430/october-update-lukesleepwalker-s-2026-resolution-a-track-a-month",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lukesleepwalker-1/october-wav&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-01-28T15:18:52+00:00",
  },
  {
    songTitle: "Some Korg 01/W grooves from the 90's.",
    artistName: "Dav",
    forumMember: "Dav",
    mediaUrl: "https://soundcloud.com/paulieworld/iceland",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/55101/some-korg-01-w-grooves-from-the-90s",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/paulieworld/iceland&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2023-04-12T18:00:24+00:00",
  },
  {
    songTitle: "Staffpad Sketches",
    artistName: "McD",
    forumMember: "McD",
    mediaUrl: "https://soundcloud.com/user-403688328/arabesque-4-wav?si=1306f0cf483443b4ab37c626a5096a50",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/47651/staffpad-sketches",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-403688328/arabesque-4-wav?si=1306f0cf483443b4ab37c626a5096a50&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2021-11-01T03:13:43+00:00",
  },
  {
    songTitle: "daily screen capture jams (post and listen)",
    artistName: "reasOne",
    forumMember: "reasOne",
    mediaUrl: "https://www.youtube.com/watch?v=T2Xi0t8VEqI",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/42045/daily-screen-capture-jams-post-and-listen",
    embedCode: "https://www.youtube.com/embed/T2Xi0t8VEqI",
    fetchedAt: "2020-11-17T15:17:14+00:00",
  }
];

function seedIfEmpty() {
  const existing = storage.getAllTracks();
  if (existing.length === 0) {
    storage.replaceAllTracks(SEED_TRACKS);
    console.log("[radio] Seeded", SEED_TRACKS.length, "tracks.");
  }
}

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; LoopyProRadio/1.0)" } }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHtml(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function refreshFromForum(): Promise<InsertTrack[]> {
  console.log("[radio] Refreshing from forum...");
  const html = await fetchHtml("https://forum.loopypro.com/categories/creations");

  const linkRegex = /href="(\/discussion\/\d+\/[^"?#]+)"/g;
  const seen = new Set<string>();
  const links: string[] = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    const path = m[1];
    if (!seen.has(path)) { seen.add(path); links.push("https://forum.loopypro.com" + path); }
  }

  const now = "2026-04-08T00:00:00.000Z";
  const results: InsertTrack[] = [];

  for (const link of links.slice(0, 35)) {
    try {
      const tHtml = await fetchHtml(link);
      const ogTitle = tHtml.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? "";
      const songTitle = ogTitle.replace(/\s*[—–-]\s*Loopy Pro Forum\s*$/, "").trim() || "Untitled";
      const authorMatch = tHtml.match(/<meta name="author" content="([^"]+)"/);
      const forumMember = authorMatch?.[1] ?? "Unknown";

      // Find all SC player URLs in the page (last one = most recent)
      const scPlayers = [...tHtml.matchAll(/https?:\/\/w\.soundcloud\.com\/player\/\?[^\s"'<>]+/g)];
      // Find all YT embeds (last one = most recent)
      const ytEmbeds = [...tHtml.matchAll(/https?:\/\/(?:www\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{11})/g)];
      const ytWatchUrls = [...tHtml.matchAll(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/g)];
      const hearthisUrls = [...tHtml.matchAll(/https?:\/\/(?:hearthis\.at|app\.hearthis\.at)\/[^\s"'<>)]+/g)];
      const scDirectUrls = [...tHtml.matchAll(/https?:\/\/(?:on\.)?soundcloud\.com\/[^\s"'<>)&]+/g)];

      let mediaUrl = "";
      let mediaType = "";
      let embedCode: string | null = null;

      if (scPlayers.length > 0) {
        // Use the last SC player widget (most recent post)
        const raw = scPlayers[scPlayers.length - 1][0].replace(/&amp;/g, "&");
        embedCode = raw;
        mediaType = "soundcloud";
        // Extract track URL from embed
        const urlParam = raw.match(/url=([^&]+)/)?.[1];
        mediaUrl = urlParam ? decodeURIComponent(urlParam) : (scDirectUrls[scDirectUrls.length - 1]?.[0] ?? raw);
      } else if (ytEmbeds.length > 0) {
        const vid = ytEmbeds[ytEmbeds.length - 1][1];
        mediaUrl = `https://www.youtube.com/watch?v=${vid}`;
        embedCode = `https://www.youtube.com/embed/${vid}`;
        mediaType = "youtube";
      } else if (ytWatchUrls.length > 0) {
        const vid = ytWatchUrls[ytWatchUrls.length - 1][1];
        mediaUrl = `https://www.youtube.com/watch?v=${vid}`;
        embedCode = `https://www.youtube.com/embed/${vid}`;
        mediaType = "youtube";
      } else if (hearthisUrls.length > 0) {
        mediaUrl = hearthisUrls[hearthisUrls.length - 1][0];
        mediaType = "hearthis";
      } else if (scDirectUrls.length > 0) {
        mediaUrl = scDirectUrls[scDirectUrls.length - 1][0];
        mediaType = "soundcloud";
      } else {
        continue; // No audio found
      }

      results.push({ songTitle, artistName: forumMember, forumMember, mediaUrl, mediaType, threadUrl: link, embedCode, fetchedAt: now });
    } catch (e) {
      console.warn("[radio] Failed:", link, (e as Error).message);
    }
  }
  return results;
}

export async function registerRoutes(httpServer: Server, app: Express) {
  seedIfEmpty();

  app.get("/api/tracks", (_req, res) => {
    res.json(storage.getAllTracks());
  });

  app.get("/api/tracks/status", (_req, res) => {
    res.json({ fetchedAt: storage.getLastFetchedAt(), count: storage.getAllTracks().length });
  });

  app.post("/api/tracks/refresh", async (_req, res) => {
    try {
      const fresh = await refreshFromForum();
      if (fresh.length >= 5) {
        storage.replaceAllTracks(fresh);
        res.json({ success: true, count: fresh.length, fetchedAt: "2026-04-08T00:00:00.000Z" });
      } else {
        res.json({ success: false, message: `Only ${fresh.length} tracks found, keeping existing data.` });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
}
