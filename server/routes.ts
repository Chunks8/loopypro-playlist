import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import type { InsertTrack } from "@shared/schema";
import * as https from "https";
import * as http from "http";

// Corrected, deduplicated seed tracks — most recent post per thread
const SEED_TRACKS: InsertTrack[] = [
  {
    songTitle: "Gearing up for Drone Day",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=U5RCYx3Q-i4",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68523/gearing-up-for-drone-day",
    embedCode: "https://www.youtube.com/embed/U5RCYx3Q-i4",
    fetchedAt: "2026-05-19T21:43:27+00:00",
  },
  {
    songTitle: "Smile cover.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=6HGlRwaVx-8",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68522/smile-cover",
    embedCode: "https://www.youtube.com/embed/6HGlRwaVx-8",
    fetchedAt: "2026-05-19T20:01:51+00:00",
  },
  {
    songTitle: "JWM's Music May 2026",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/80PxBAN9mYQRZHuyp7",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68333/jwms-music-may-2026",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-happy-78th%3Fsi%3Df6c4e4541ce94be9bbd2d584b6989c64%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-05-19T19:00:02+00:00",
  },
  {
    songTitle: "Primes",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/365-primes?si=716971d05e3c4158a8b5c658a5d5ee55",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68518/primes",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/365-primes?si=716971d05e3c4158a8b5c658a5d5ee55&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-19T10:36:40+00:00",
  },
  {
    songTitle: "The Wagtunes Corner",
    artistName: "wagtunes",
    forumMember: "wagtunes",
    mediaUrl: "https://soundcloud.com/steven-wagenheim/walking-in-the-out-door",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/66861/the-wagtunes-corner",
    embedCode: "https://w.soundcloud.com/player/?url=https://soundcloud.com/steven-wagenheim/walking-in-the-out-door&color=ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false",
    fetchedAt: "2026-05-18T23:10:18+00:00",
  },
  {
    songTitle: "Quantovox real phase.Demo with backing track.what a great app.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=otuuBU7TlI4",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68513/quantovox-real-phase-demo-with-backing-track-what-a-great-app",
    embedCode: "https://www.youtube.com/embed/otuuBU7TlI4",
    fetchedAt: "2026-05-18T19:21:03+00:00",
  },
  {
    songTitle: "Beacon - A new track thanks to tyslothrop1",
    artistName: "a.rabbit",
    forumMember: "a.rabbit",
    mediaUrl: "https://www.youtube.com/watch?v=9awtzd5_i5A",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68512/beacon-a-new-track-thanks-to-tyslothrop1",
    embedCode: "https://www.youtube.com/embed/9awtzd5_i5A",
    fetchedAt: "2026-05-18T19:11:54+00:00",
  },
  {
    songTitle: "Luc.A - My skin (Tech House in Korg Gadget)",
    artistName: "Luc_A",
    forumMember: "Luc_A",
    mediaUrl: "https://soundcloud.com/luca_production/my-skin?si=e015d3ce50c34b55a7d5c86c57329c2d",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68511/luc-a-my-skin-tech-house-in-korg-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/luca_production/my-skin?si=e015d3ce50c34b55a7d5c86c57329c2d&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-18T17:27:00+00:00",
  },
  {
    songTitle: "A Body of Water",
    artistName: "Kashi",
    forumMember: "Kashi",
    mediaUrl: "https://www.youtube.com/watch?v=cBgfhWADAig",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68510/a-body-of-water",
    embedCode: "https://www.youtube.com/embed/cBgfhWADAig",
    fetchedAt: "2026-05-18T15:57:57+00:00",
  },
  {
    songTitle: "New album Easylistening, jazz with 2 brand-new tracks!",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/easylistening",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68498/new-album-easylistening-jazz-with-2-brand-new-tracks",
    embedCode: "https://app.hearthis.at/embed/14357491/transparent_black/?",
    fetchedAt: "2026-05-17T20:22:51+00:00",
  },
  {
    songTitle: "Improvisation in the style of\u2026\u2026\u2026guess.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=6qplNyIQEXg",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68497/improvisation-in-the-style-of-guess",
    embedCode: "https://www.youtube.com/embed/6qplNyIQEXg",
    fetchedAt: "2026-05-17T20:09:00+00:00",
  },
  {
    songTitle: "Quantovox real phase guitar demo.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=i3Z8bm0nZXs",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68491/quantovox-real-phase-guitar-demo",
    embedCode: "https://www.youtube.com/embed/i3Z8bm0nZXs",
    fetchedAt: "2026-05-17T15:26:15+00:00",
  },
  {
    songTitle: "Atmosphere",
    artistName: "Paulieworld",
    forumMember: "Paulieworld",
    mediaUrl: "https://soundcloud.com/paulieworld/atmosphere",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68487/atmosphere",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/paulieworld/atmosphere&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-16T18:38:48+00:00",
  },
  {
    songTitle: "Quantovox melthaven as a univibe?",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=ayHTge2fEXY",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68482/quantovox-melthaven-as-a-univibe",
    embedCode: "https://www.youtube.com/embed/ayHTge2fEXY",
    fetchedAt: "2026-05-16T11:09:51+00:00",
  },
  {
    songTitle: "I blame The Sound Test Room: To An Artificial Mind All Reality Is Virtual",
    artistName: "Svetlovska",
    forumMember: "Svetlovska",
    mediaUrl: "https://soundcloud.com/irena-svetlovska/to-an-artificial-mind-all?si=9daa5214554645168eaa6cb72d6cad6b",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68476/i-blame-the-sound-test-room-to-an-artificial-mind-all-reality-is-virtual",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/irena-svetlovska/to-an-artificial-mind-all?si=9daa5214554645168eaa6cb72d6cad6b&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-15T09:36:28+00:00",
  },
  {
    songTitle: "Quantavox Melthaven guitar demo.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=9ren891UBw0",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68472/quantavox-melthaven-guitar-demo",
    embedCode: "https://www.youtube.com/embed/9ren891UBw0",
    fetchedAt: "2026-05-14T14:52:35+00:00",
  },
  {
    songTitle: "Channeling my inner Aphex Twin",
    artistName: "kyrillik",
    forumMember: "kyrillik",
    mediaUrl: "https://www.youtube.com/watch?v=uMbMpa7N12g",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68465/channeling-my-inner-aphex-twin",
    embedCode: "https://www.youtube.com/embed/uMbMpa7N12g",
    fetchedAt: "2026-05-14T08:22:42+00:00",
  },
  {
    songTitle: "Collaboration inquiry",
    artistName: "CapgrasSick",
    forumMember: "CapgrasSick",
    mediaUrl: "https://soundcloud.com/paulieworld",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68459/collaboration-inquiry",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fpaulieworld&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-05-13T18:18:56+00:00",
  },
  {
    songTitle: "Way Out",
    artistName: "Paulieworld",
    forumMember: "Paulieworld",
    mediaUrl: "https://soundcloud.com/paulieworld/way-out",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68458/way-out",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/paulieworld/way-out&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-13T16:59:36+00:00",
  },
  {
    songTitle: "The sorcery of Koala",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=3A_H76yITW8",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68452/the-sorcery-of-koala",
    embedCode: "https://www.youtube.com/embed/3A_H76yITW8",
    fetchedAt: "2026-05-12T22:20:24+00:00",
  },
  {
    songTitle: "A Saturday night at Ronnie\u202fScott\u2019s - frenq",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/a-saturday-night",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68436/a-saturday-night-at-ronnie-scott-s-frenq",
    embedCode: "https://app.hearthis.at/embed/14318284/transparent_black/?",
    fetchedAt: "2026-05-11T07:37:14+00:00",
  },
  {
    songTitle: "Backing Tracks: \"Dark Spacewalk\" in C Lydian",
    artistName: "jimhanks",
    forumMember: "jimhanks",
    mediaUrl: "https://www.youtube.com/watch?v=CHZk5ElfT7Y",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68434/backing-tracks-dark-spacewalk-in-c-lydian",
    embedCode: "https://www.youtube.com/embed/CHZk5ElfT7Y",
    fetchedAt: "2026-05-11T01:38:38+00:00",
  },
  {
    songTitle: "shapesynth anyone?",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=yOAD3vvNpF4",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68433/shapesynth-anyone",
    embedCode: "https://www.youtube.com/embed/yOAD3vvNpF4",
    fetchedAt: "2026-05-10T23:04:21+00:00",
  },
  {
    songTitle: "New track-Link audio stress testing",
    artistName: "ecamburn",
    forumMember: "ecamburn",
    mediaUrl: "https://soundcloud.com/atm0spher1c/transition-2?si=8bef98545dc44a5a9a4a3a80594e9ab7",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68431/new-track-link-audio-stress-testing",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/atm0spher1c/transition-2?si=8bef98545dc44a5a9a4a3a80594e9ab7&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-10T18:44:36+00:00",
  },
  {
    songTitle: "How insensitive improvisation",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=lx5ge2uQWm4",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68415/how-insensitive-improvisation",
    embedCode: "https://www.youtube.com/embed/lx5ge2uQWm4",
    fetchedAt: "2026-05-08T18:56:41+00:00",
  },
  {
    songTitle: "In Motion (Omnisphere, Vital Series: Mallets, Noire, Repro-5, Continua)",
    artistName: "DavidEnglish",
    forumMember: "DavidEnglish",
    mediaUrl: "https://www.youtube.com/watch?v=Kew6QccF2bc",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68414/in-motion-omnisphere-vital-series-mallets-noire-repro-5-continua",
    embedCode: "https://www.youtube.com/embed/Kew6QccF2bc",
    fetchedAt: "2026-05-08T17:08:08+00:00",
  },
  {
    songTitle: "Pulse - New ambient track mastered with Afterglow",
    artistName: "a.rabbit",
    forumMember: "a.rabbit",
    mediaUrl: "https://www.youtube.com/watch?v=wGxvrtJllgI",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68408/pulse-new-ambient-track-mastered-with-afterglow",
    embedCode: "https://www.youtube.com/embed/wGxvrtJllgI",
    fetchedAt: "2026-05-08T02:21:29+00:00",
  },
  {
    songTitle: "Luc.A - Sometimes (Deep House in Korg Gadget)",
    artistName: "Luc_A",
    forumMember: "Luc_A",
    mediaUrl: "https://soundcloud.com/luca_production/sometimes?si=4027c7af711a4850810f581db9fb38cb",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68402/luc-a-sometimes-deep-house-in-korg-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/luca_production/sometimes?si=4027c7af711a4850810f581db9fb38cb&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-07T16:56:49+00:00",
  },
  {
    songTitle: "While my guitar\u2026\u2026improvisation.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=ub1iR6W7V8s",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68390/while-my-guitar-improvisation",
    embedCode: "https://www.youtube.com/embed/ub1iR6W7V8s",
    fetchedAt: "2026-05-06T20:56:37+00:00",
  },
  {
    songTitle: "countenance - a Koala thing",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=fNrT0lNWUSs",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68381/countenance-a-koala-thing",
    embedCode: "https://www.youtube.com/embed/fNrT0lNWUSs",
    fetchedAt: "2026-05-05T22:07:55+00:00",
  },
  {
    songTitle: "Zvon's 12 Reward Sample Packs from Year 1 available to all for purchase (video demo)",
    artistName: "zvon",
    forumMember: "zvon",
    mediaUrl: "https://www.youtube.com/watch?v=qOI8JaWDqrs",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68366/zvons-12-reward-sample-packs-from-year-1-available-to-all-for-purchase-video-demo",
    embedCode: "https://www.youtube.com/embed/qOI8JaWDqrs",
    fetchedAt: "2026-05-04T19:27:00+00:00",
  },
  {
    songTitle: "First real ambient album (Yoga), The great Dutch RIVERS!",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/rivers",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68359/first-real-ambient-album-yoga-the-great-dutch-rivers",
    embedCode: "https://app.hearthis.at/embed/14262656/transparent_black/?",
    fetchedAt: "2026-05-04T13:49:27+00:00",
  },
  {
    songTitle: "Iwave5 my new Song made with Loopy Pro",
    artistName: "ErikWerkema",
    forumMember: "ErikWerkema",
    mediaUrl: "https://www.youtube.com/watch?v=lQHf44DFV3U",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68357/iwave5-my-new-song-made-with-loopy-pro",
    embedCode: "https://www.youtube.com/embed/lQHf44DFV3U",
    fetchedAt: "2026-05-04T09:04:16+00:00",
  },
  {
    songTitle: "Folk|Jazz|Rock|Ambient",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/362-folk-jazz-rock-ambient?si=afec35642a0c4faa9fd676aada60947c",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68350/folk-jazz-rock-ambient",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/362-folk-jazz-rock-ambient?si=afec35642a0c4faa9fd676aada60947c&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-03T16:28:38+00:00",
  },
  {
    songTitle: "UpsideDown - My first full ambient track",
    artistName: "a.rabbit",
    forumMember: "a.rabbit",
    mediaUrl: "https://www.youtube.com/watch?v=xfFHPx5n-7E",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68341/upsidedown-my-first-full-ambient-track",
    embedCode: "https://www.youtube.com/embed/xfFHPx5n-7E",
    fetchedAt: "2026-05-01T23:26:41+00:00",
  },
  {
    songTitle: "FHTH - For Those Who Sailed West (industrial, synth pop)",
    artistName: "Slava",
    forumMember: "Slava",
    mediaUrl: "https://www.youtube.com/watch?v=sTU7vhVHius",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68335/fhth-for-those-who-sailed-west-industrial-synth-pop",
    embedCode: "https://www.youtube.com/embed/sTU7vhVHius",
    fetchedAt: "2026-05-01T03:45:32+00:00",
  },
  {
    songTitle: "My second ambient piece 'De linge (The Linge)'",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/la-meuse",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68334/my-second-ambient-piece-de-linge-the-linge",
    embedCode: "https://app.hearthis.at/embed/14235792/transparent_black/?",
    fetchedAt: "2026-05-01T02:35:51+00:00",
  },
  {
    songTitle: "Back to Outgrowrh",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=pGoQiHwRPIg",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68332/back-to-outgrowrh",
    embedCode: "https://www.youtube.com/embed/pGoQiHwRPIg",
    fetchedAt: "2026-04-30T21:57:49+00:00",
  },
  {
    songTitle: "JWM - The Patch EP (Tech House EP in FLSM)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/jGtEAKI0QAjPnhAtUH",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68331/jwm-the-patch-ep-tech-house-ep-in-flsm",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-the-patch-ep%3Fsi%3Def1da294b030452b876fbe6fe03c6a1e%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-30T20:34:00+00:00",
  },
  {
    songTitle: "DanSeb - Unravelling | Dance&EDM | Logic Pro",
    artistName: "DanSebPage",
    forumMember: "DanSebPage",
    mediaUrl: "https://www.youtube.com/watch?v=rwDiXXIJQWg",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68328/danseb-unravelling-dance-edm-logic-pro",
    embedCode: "https://www.youtube.com/embed/rwDiXXIJQWg",
    fetchedAt: "2026-04-30T14:36:43+00:00",
  },
  {
    songTitle: "Brothers in arms cover ( new version).",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=et8HovCU5Vg",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68326/brothers-in-arms-cover-new-version",
    embedCode: "https://www.youtube.com/embed/et8HovCU5Vg",
    fetchedAt: "2026-04-30T11:50:57+00:00",
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
    songTitle: "Mojotele65/Elet Ojom\u2019s Music - 2026",
    artistName: "Mojotele65",
    forumMember: "Mojotele65",
    mediaUrl: "https://www.youtube.com/watch?v=6uQ6ZyFoFmQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68267/mojotele65-elet-ojom-s-music-2026",
    embedCode: "https://www.youtube.com/embed/6uQ6ZyFoFmQ",
    fetchedAt: "2026-04-24T12:21:55+00:00",
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
    mediaUrl: "https://on.soundcloud.com/gm34LLZlc04oGttef2",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68194/tape-test-a-boc-inspired-ambient-piece-in-korg-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-untitled-auxy-album%3Fref%3Dclipboard%26p%3Di%26c%3D1%26si%3D21B8982C294149EBA2780C32A440BB47%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-17T17:41:43+00:00",
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
    songTitle: "A thread of improvised orchestra sketches",
    artistName: "McD",
    forumMember: "McD",
    mediaUrl: "https://soundcloud.com/user-403688328/fan-faire?si=b6f8a45d29e945b88ea797c1b813e0ce",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/67823/a-thread-of-improvised-orchestra-sketches",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-403688328/fan-faire?si=b6f8a45d29e945b88ea797c1b813e0ce&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-03-08T00:58:02+00:00",
  },
  {
    songTitle: "lukesleepwalker\u2019s 2026 resolution: a track a month (updated for May)",
    artistName: "lukesleepwalker",
    forumMember: "lukesleepwalker",
    mediaUrl: "https://soundcloud.com/lukesleepwalker-1/may-wav",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/67430/lukesleepwalker-s-2026-resolution-a-track-a-month-updated-for-may",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lukesleepwalker-1/may-wav&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
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
    songTitle: "echo opera: daily dose of music compilation thread",
    artistName: "echoopera",
    forumMember: "echoopera",
    mediaUrl: "https://www.youtube.com/watch?v=fCtkaePAERI",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/50272/echo-opera-daily-dose-of-music-compilation-thread",
    embedCode: "https://www.youtube.com/embed/fCtkaePAERI",
    fetchedAt: "2022-05-21T05:36:34+00:00",
  },
  {
    songTitle: "-The Pixel Producers - Everyday Music Thread",
    artistName: "Thepixelproducers",
    forumMember: "Thepixelproducers",
    mediaUrl: "https://www.youtube.com/watch?v=tyTCXhAWF5U",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/49403/the-pixel-producers-everyday-music-thread",
    embedCode: "https://www.youtube.com/embed/tyTCXhAWF5U",
    fetchedAt: "2022-03-09T00:37:27+00:00",
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
