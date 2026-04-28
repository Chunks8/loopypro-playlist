import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import type { InsertTrack } from "@shared/schema";
import * as https from "https";
import * as http from "http";

// Corrected, deduplicated seed tracks — most recent post per thread
const SEED_TRACKS: InsertTrack[] = [
  {
    songTitle: "The Wagtunes Corner",
    artistName: "wagtunes",
    forumMember: "wagtunes",
    mediaUrl: "https://soundcloud.com/steven-wagenheim/ah",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/66861/the-wagtunes-corner",
    embedCode: "https://w.soundcloud.com/player/?url=https://soundcloud.com/steven-wagenheim/ah&color=ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-28T18:39:20+00:00",
  },
  {
    songTitle: "New small fusion album Coming Home (two new tracks)",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/coming-home",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68304/new-small-fusion-album-coming-home-two-new-tracks",
    embedCode: "https://app.hearthis.at/embed/14239022/transparent_black/?",
    fetchedAt: "2026-04-28T13:16:16+00:00",
  },
  {
    songTitle: "Improvisation with Nam xt.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=sZz3mIapxKY",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68303/improvisation-with-nam-xt",
    embedCode: "https://www.youtube.com/embed/sZz3mIapxKY",
    fetchedAt: "2026-04-28T13:08:04+00:00",
  },
  {
    songTitle: "JWM's Music (rest of) April 2026 (various genres within!)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/9LizZnNgDomBh5KuRL",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68242/jwms-music-rest-of-april-2026-various-genres-within",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-triphop-lullaby%3Fsi%3D10f62dd73966408da94baac715abedc7%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-27T17:12:21+00:00",
  },
  {
    songTitle: "The \"Desert Island Synth\" Challenge, May 2026",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/qSM7kq9S93w94C0Jm2",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68292/the-desert-island-synth-challenge-may-2026",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-desert-sunrise%3Fsi%3D780223bd713f44d79e4fd9c5228bd1c2%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-27T03:55:49+00:00",
  },
  {
    songTitle: "La Meuse my first real ambient track",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/la-meuse",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68287/la-meuse-my-first-real-ambient-track",
    embedCode: "https://app.hearthis.at/embed/14235792/transparent_black/?",
    fetchedAt: "2026-04-27T01:32:04+00:00",
  },
  {
    songTitle: "Tape 1 - a track inspired by Boards of Canada",
    artistName: "timfromtheborder",
    forumMember: "timfromtheborder",
    mediaUrl: "https://www.youtube.com/watch?v=2ZCfpmlk4uU",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68283/tape-1-a-track-inspired-by-boards-of-canada",
    embedCode: "https://www.youtube.com/embed/2ZCfpmlk4uU",
    fetchedAt: "2026-04-26T18:04:06+00:00",
  },
  {
    songTitle: "Ritchie Blackmore tribute",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=Eikw8_-It3Y",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68277/ritchie-blackmore-tribute",
    embedCode: "https://www.youtube.com/embed/Eikw8_-It3Y",
    fetchedAt: "2026-04-25T11:56:09+00:00",
  },
  {
    songTitle: "Isle of Arran",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/sets/isle-of-arran",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68272/isle-of-arran",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fgeotony%2Fsets%2Fisle-of-arran&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-24T19:25:14+00:00",
  },
  {
    songTitle: "The Navigator (Solo, Noire, Continua)",
    artistName: "DavidEnglish",
    forumMember: "DavidEnglish",
    mediaUrl: "https://www.youtube.com/watch?v=XnOcZJdslWQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68269/the-navigator-solo-noire-continua",
    embedCode: "https://www.youtube.com/embed/XnOcZJdslWQ",
    fetchedAt: "2026-04-24T17:09:08+00:00",
  },
  {
    songTitle: "Tribute to David Gilmour.Marooned",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=BoY0rW9KQRQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68268/tribute-to-david-gilmour-marooned",
    embedCode: "https://www.youtube.com/embed/BoY0rW9KQRQ",
    fetchedAt: "2026-04-24T16:36:13+00:00",
  },
  {
    songTitle: "A confluence of interests: There Is No Antimemetics Division",
    artistName: "Svetlovska",
    forumMember: "Svetlovska",
    mediaUrl: "https://soundcloud.com/irena-svetlovska/there-is-no-antimemetics?si=08e3015778604addbe97e537b80d4fde",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68262/a-confluence-of-interests-there-is-no-antimemetics-division",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/irena-svetlovska/there-is-no-antimemetics?si=08e3015778604addbe97e537b80d4fde&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-23T23:16:23+00:00",
  },
  {
    songTitle: "flight, a new track with video",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=ADIjJjLQeiQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68260/flight-a-new-track-with-video",
    embedCode: "https://www.youtube.com/embed/ADIjJjLQeiQ",
    fetchedAt: "2026-04-23T21:05:36+00:00",
  },
  {
    songTitle: "New fusion track called MACH5 from the upcoming album Coming Home",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/mach5",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68239/new-fusion-track-called-mach5-from-the-upcoming-album-coming-home",
    embedCode: "https://app.hearthis.at/embed/14207931/transparent_black/?",
    fetchedAt: "2026-04-21T17:28:54+00:00",
  },
  {
    songTitle: "Marching Band Horn sample set (Kontakt + soundfont) with demo in Gestrument",
    artistName: "zvon",
    forumMember: "zvon",
    mediaUrl: "https://www.youtube.com/watch?v=VrFbLPGyX2A",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68237/marching-band-horn-sample-set-kontakt-soundfont-with-demo-in-gestrument",
    embedCode: "https://www.youtube.com/embed/VrFbLPGyX2A",
    fetchedAt: "2026-04-21T15:25:31+00:00",
  },
  {
    songTitle: "\"Gentle Lullaby\" (Orchestral Downtempo in Korg Gadget)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/MrShbw4thows5N4eh4",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68226/gentle-lullaby-orchestral-downtempo-in-korg-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-gentle-lullaby%3Fsi%3D8e3c48c27e8f4435a7a4cd5517885bec%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-20T19:01:15+00:00",
  },
  {
    songTitle: "Chitlin con carne cover.NAM XT.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=MbK-ha0VytE",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68221/chitlin-con-carne-cover-nam-xt",
    embedCode: "https://www.youtube.com/embed/MbK-ha0VytE",
    fetchedAt: "2026-04-20T10:43:28+00:00",
  },
  {
    songTitle: "\"After the Storm\" (Lofi in Korg Gadget)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/FDoMyTwEciJl0qQJsm",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68213/after-the-storm-lofi-in-korg-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-after-the-storm%3Fsi%3D96aeafc20f3d43f092906a8afa372790%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-19T18:13:34+00:00",
  },
  {
    songTitle: "Live Session iPad",
    artistName: "RedSkyLullaby",
    forumMember: "RedSkyLullaby",
    mediaUrl: "https://www.youtube.com/watch?v=FeEde9QI17w",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68212/live-session-ipad",
    embedCode: "https://www.youtube.com/embed/FeEde9QI17w",
    fetchedAt: "2026-04-19T16:22:01+00:00",
  },
  {
    songTitle: "\"Ambient Beat Thing\" (Electronic Music in Gadget)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/bu1ZeMjNKGoSKfPH1z",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68207/ambient-beat-thing-electronic-music-in-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-ambient-beat-thing%3Fsi%3D4342ee07d6384764838a30e9633850ce%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-18T21:35:42+00:00",
  },
  {
    songTitle: "A new Koala/Outgrowth track",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=HgA2mhC1tfo",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68202/a-new-koala-outgrowth-track",
    embedCode: "https://www.youtube.com/embed/HgA2mhC1tfo",
    fetchedAt: "2026-04-18T16:15:45+00:00",
  },
  {
    songTitle: "\"Soft Breaks\" (BoC-inspired piece of Ambient in Gadget)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/JC0btMdsZkwsuZ0j7U",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68197/soft-breaks-boc-inspired-piece-of-ambient-in-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-soft-breaks%3Fsi%3Dc67320db576340e3a18f95eb512aa72e%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-18T03:27:11+00:00",
  },
  {
    songTitle: "\"Tape Test\" (A BoC-inspired Ambient piece in Korg Gadget)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/UfLiyoWRVQwlll2kW1",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68194/tape-test-a-boc-inspired-ambient-piece-in-korg-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-tape-test%3Fsi%3D97b9f619f73842d78e1e7fd1c754bd11%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-17T17:41:43+00:00",
  },
  {
    songTitle: "Happy to announce Horseflies a new single recording",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/horseflies",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68191/happy-to-announce-horseflies-a-new-single-recording",
    embedCode: "https://app.hearthis.at/embed/14181159/transparent_black/?",
    fetchedAt: "2026-04-17T12:59:22+00:00",
  },
  {
    songTitle: "Cosmic ambient in a pop-up void\u2026 \u201cSleeping Through the Apogee\u201d",
    artistName: "wired2moon",
    forumMember: "wired2moon",
    mediaUrl: "https://www.youtube.com/watch?v=AUS_wdpDHfE",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68178/cosmic-ambient-in-a-pop-up-void-sleeping-through-the-apogee",
    embedCode: "https://www.youtube.com/embed/AUS_wdpDHfE",
    fetchedAt: "2026-04-16T08:50:44+00:00",
  },
  {
    songTitle: "My most recent track",
    artistName: "Gravitas",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/SJJOnBHE3yGvkNx1gE",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68164/my-most-recent-track",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fmdbch1%2Fkire-opto-rough-master-89-bpm%3Fsi%3D6acd2728a549426189adf087486ec4fb%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-15T03:59:30+00:00",
  },
  {
    songTitle: "\"The Modern Classic\" (Neo-90s House in Gadget)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/aLXxZaDDCvCYo1hgZF",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68160/the-modern-classic-neo-90s-house-in-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-exceeding-expectations%3Fref%3Dclipboard%26p%3Di%26c%3D1%26si%3D591B37312C664E9AA61C3B7E5BB64B06%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-14T21:09:17+00:00",
  },
  {
    songTitle: "Greetings from the Cornucopia Sector! Another Exosphere (et al) jam",
    artistName: "id_23",
    forumMember: "id_23",
    mediaUrl: "https://soundcloud.com/jak_larson/the-cornucopia-sector-node-113",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68159/greetings-from-the-cornucopia-sector-another-exosphere-et-al-jam",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jak_larson/the-cornucopia-sector-node-113&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-14T21:08:32+00:00",
  },
  {
    songTitle: "Power Tends to Corrupt and...",
    artistName: "zvon",
    forumMember: "zvon",
    mediaUrl: "https://www.youtube.com/watch?v=Gm3DXG5jT3c",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68158/power-tends-to-corrupt-and",
    embedCode: "https://www.youtube.com/embed/Gm3DXG5jT3c",
    fetchedAt: "2026-04-14T19:26:41+00:00",
  },
  {
    songTitle: "Steady As She Blows-Opto Rough Master-126 Bpm",
    artistName: "Gravitas",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/sTuSa2ioQmquGXCATh",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68157/steady-as-she-blows-opto-rough-master-126-bpm",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fmdbch1%2Fsteady-as-she-blows-opto-rough%3Fsi%3Dccb4bdcc2d3140e997d9fdcf198e5383%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-14T17:32:37+00:00",
  },
  {
    songTitle: "Luc.A - The cave (House in Groove Rider 2)",
    artistName: "Luc_A",
    forumMember: "Luc_A",
    mediaUrl: "https://soundcloud.com/luca_production/the-cave?si=ba86e1e329f3488293625e099b658159",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68156/luc-a-the-cave-house-in-groove-rider-2",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/luca_production/the-cave?si=ba86e1e329f3488293625e099b658159&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-14T16:18:02+00:00",
  },
  {
    songTitle: "Space in the 70\u2019s. A koala ambient thing.",
    artistName: "sevenape",
    forumMember: "sevenape",
    mediaUrl: "https://www.youtube.com/watch?v=Jkfd5CgTUGA",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68155/space-in-the-70-s-a-koala-ambient-thing",
    embedCode: "https://www.youtube.com/embed/Jkfd5CgTUGA",
    fetchedAt: "2026-04-14T10:45:43+00:00",
  },
  {
    songTitle: "\"A Bass Thing\" (Bass House EDM Stuff Created in Gadget)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-a-bass-thing",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68154/a-bass-thing-bass-house-edm-stuff-created-in-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jwmmakerofmusic/jwm-a-bass-thing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-13T21:49:14+00:00",
  },
  {
    songTitle: "Well Considered",
    artistName: "Gravitas",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/6liFAn6gYRpqltDwMk",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68152/well-considered",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fmdbch1%2Fwell-considered-139-opto-rough%3Fsi%3D4f7a821f7a5140d0b4ab6f96bf2601b4%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-13T20:12:08+00:00",
  },
  {
    songTitle: "I, CANNIBAL",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=8ZLsGnwhyEw",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68149/i-cannibal",
    embedCode: "https://www.youtube.com/embed/8ZLsGnwhyEw",
    fetchedAt: "2026-04-13T12:51:57+00:00",
  },
  {
    songTitle: "Heavy Lifting - Headphone mix",
    artistName: "Gravitas",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/Jp89XO4lxCMCQZjbc6",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68142/heavy-lifting-headphone-mix",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fmdbch1%2Fheavy-lifting-opto-mix-rough%3Fsi%3Dfb4a268c699e4f5795917861a131d752%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-13T02:20:03+00:00",
  },
  {
    songTitle: "'Going Home' another new blues recording in collab with pbelgium",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/going-home",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68140/going-home-another-new-blues-recording-in-collab-with-pbelgium",
    embedCode: "https://app.hearthis.at/embed/14147295/transparent_black/?",
    fetchedAt: "2026-04-12T19:47:13+00:00",
  },
  {
    songTitle: "@egobeats favorite \ud83d\ude42",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=_sBlmfP15CM",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68133/egobeats-favorite",
    embedCode: "https://www.youtube.com/embed/_sBlmfP15CM",
    fetchedAt: "2026-04-12T02:22:13+00:00",
  },
  {
    songTitle: "JWM - Bored Beat (TripHop inspired by BoC done in Gadget)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://www.youtube.com/watch?v=c3RGBN8b19Y",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68131/jwm-bored-beat-triphop-inspired-by-boc-done-in-gadget",
    embedCode: "https://www.youtube.com/embed/c3RGBN8b19Y",
    fetchedAt: "2026-04-11T15:52:29+00:00",
  },
  {
    songTitle: "JWM - Exceeding Expectations (Electro-House in Auxy Studio)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-exceeding-expectations",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68123/jwm-exceeding-expectations-electro-house-in-auxy-studio",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jwmmakerofmusic/jwm-exceeding-expectations&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-11T01:51:40+00:00",
  },
  {
    songTitle: "A weird one",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=xcd14C9z9FI",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68122/a-weird-one",
    embedCode: "https://www.youtube.com/embed/xcd14C9z9FI",
    fetchedAt: "2026-04-11T00:55:03+00:00",
  },
  {
    songTitle: "Drifting (Intimate Cello, Vital Series: Mallets, Velvet Guitar, Noire, Solo, Continua)",
    artistName: "DavidEnglish",
    forumMember: "DavidEnglish",
    mediaUrl: "https://www.youtube.com/watch?v=6zHWMjZeCoo",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68116/drifting-intimate-cello-vital-series-mallets-velvet-guitar-noire-solo-continua",
    embedCode: "https://www.youtube.com/embed/6zHWMjZeCoo",
    fetchedAt: "2026-04-10T17:11:11+00:00",
  },
  {
    songTitle: "bygones",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=N2_sN2N3e9I",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68112/bygones",
    embedCode: "https://www.youtube.com/embed/N2_sN2N3e9I",
    fetchedAt: "2026-04-10T02:16:53+00:00",
  },
  {
    songTitle: "JWM - Vortex (2010s Brostep in Korg Gadget 3)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-vortex",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68111/jwm-vortex-2010s-brostep-in-korg-gadget-3",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jwmmakerofmusic/jwm-vortex&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-10T01:28:50+00:00",
  },
  {
    songTitle: "First track in awhile.",
    artistName: "Gravitas",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/qkTzLlb04Mpld4dXjV",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68108/first-track-in-awhile",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fmdbch1%2Fshango-master-opto-mix-rough%3Fsi%3D45d452e28aad475abe345698310f1e7c%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-09T17:22:47+00:00",
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
    songTitle: "First go with 16 Drones & Midnight Plaza: Samsara",
    artistName: "Svetlovska",
    forumMember: "Svetlovska",
    mediaUrl: "https://www.youtube.com/watch?v=c3wk9WWTfNs",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68091/first-go-with-16-drones-midnight-plaza-samsara",
    embedCode: "https://www.youtube.com/embed/c3wk9WWTfNs",
    fetchedAt: "2026-04-08T07:53:03+00:00",
  },
  {
    songTitle: "MIDNIGHT BLUES a new recording in collab with pbelgium",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/midnight-blues",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68072/midnight-blues-a-new-recording-in-collab-with-pbelgium",
    embedCode: "https://app.hearthis.at/embed/14105746/transparent_black/?",
    fetchedAt: "2026-04-06T06:47:37+00:00",
  },
  {
    songTitle: "Morning Star Conjecture",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/361-morning-star-conjecture?si=3c994894a9b44f54baa73344d4157685",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68070/morning-star-conjecture",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/361-morning-star-conjecture?si=3c994894a9b44f54baa73344d4157685&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-05T15:15:46+00:00",
  },
  {
    songTitle: "Bowling Ball and Feather",
    artistName: "tubespace",
    forumMember: "tubespace",
    mediaUrl: "https://www.youtube.com/watch?v=YzB9YTnKLHE",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68061/bowling-ball-and-feather",
    embedCode: "https://www.youtube.com/embed/YzB9YTnKLHE",
    fetchedAt: "2026-04-04T02:37:36+00:00",
  },
  {
    songTitle: "Lucid Dreaming with Exosphere and VS2",
    artistName: "id_23",
    forumMember: "id_23",
    mediaUrl: "https://www.youtube.com/watch?v=h4f7LWD8hes",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68040/lucid-dreaming-with-exosphere-and-vs2",
    embedCode: "https://www.youtube.com/embed/h4f7LWD8hes",
    fetchedAt: "2026-04-02T10:41:08+00:00",
  },
  {
    songTitle: "Goodbye Pork Pie Town",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/360-goodbye-pork-pie-town?si=dfec9858e91143e0814c51f0abe70978",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68013/goodbye-pork-pie-town",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/360-goodbye-pork-pie-town?si=dfec9858e91143e0814c51f0abe70978&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-03-30T19:14:53+00:00",
  },
  {
    songTitle: "The Elusive Emergent Aether Society",
    artistName: "id_23",
    forumMember: "id_23",
    mediaUrl: "https://soundcloud.com/id_23/ambex_01-the-elusive-emergent",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68011/the-elusive-emergent-aether-society",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/id_23/ambex_01-the-elusive-emergent&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-03-30T15:45:42+00:00",
  },
  {
    songTitle: "JWM - Reggaeton Trance 032626 (Instrumental done in FL Studio Mobile)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-reggaeton-trance-032626",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68003/jwm-reggaeton-trance-032626-instrumental-done-in-fl-studio-mobile",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jwmmakerofmusic/jwm-reggaeton-trance-032626&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-03-29T23:47:40+00:00",
  },
  {
    songTitle: "EARTH a trilogy, new small album",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/earth",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/67993/earth-a-trilogy-new-small-album",
    embedCode: "https://app.hearthis.at/embed/14057310/transparent_black/?",
    fetchedAt: "2026-03-28T11:45:04+00:00",
  },
  {
    songTitle: "Reply to a challenge",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=2ijTmxJJBR4",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/67946/reply-to-a-challenge",
    embedCode: "https://www.youtube.com/embed/2ijTmxJJBR4",
    fetchedAt: "2026-03-23T14:01:21+00:00",
  },
  {
    songTitle: "Koala Ambient | Negative Space Challenge |",
    artistName: "tubespace",
    forumMember: "tubespace",
    mediaUrl: "https://www.youtube.com/watch?v=flOkVMxPeSE",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/67937/koala-ambient-negative-space-challenge",
    embedCode: "https://www.youtube.com/embed/flOkVMxPeSE",
    fetchedAt: "2026-03-22T04:16:43+00:00",
  },
  {
    songTitle: "A thread of improvised orchestra sketches",
    artistName: "McD",
    forumMember: "McD",
    mediaUrl: "https://soundcloud.com/user-403688328/spring-arrival-wav?si=73efb58e82ef44088b898a8e7656fbf5",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/67823/a-thread-of-improvised-orchestra-sketches",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-403688328/spring-arrival-wav?si=73efb58e82ef44088b898a8e7656fbf5&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-03-08T00:58:02+00:00",
  },
  {
    songTitle: "Frondescentia",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/357-frondescentia?si=482c9e87476b4b8286927d8c7fda708f",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/67767/frondescentia",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/357-frondescentia?si=482c9e87476b4b8286927d8c7fda708f&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-03-01T20:37:43+00:00",
  },
  {
    songTitle: "Acoustic cover mashup Find Me / Take me to the river",
    artistName: "TheAudioDabbler",
    forumMember: "TheAudioDabbler",
    mediaUrl: "https://www.youtube.com/watch?v=j-YOJTXZAY4",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/67669/acoustic-cover-mashup-find-me-take-me-to-the-river",
    embedCode: "https://www.youtube.com/embed/j-YOJTXZAY4",
    fetchedAt: "2026-02-19T12:10:35+00:00",
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
    songTitle: "echo opera: daily dose of music compilation thread",
    artistName: "echoopera",
    forumMember: "echoopera",
    mediaUrl: "https://www.youtube.com/watch?v=fCtkaePAERI",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/50272/echo-opera-daily-dose-of-music-compilation-thread",
    embedCode: "https://www.youtube.com/embed/fCtkaePAERI",
    fetchedAt: "2022-05-21T05:36:34+00:00",
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
