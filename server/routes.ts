import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import type { InsertTrack } from "@shared/schema";
import * as https from "https";
import * as http from "http";

// Corrected, deduplicated seed tracks — most recent post per thread
const SEED_TRACKS: InsertTrack[] = [
  {
    songTitle: "Flowers [DRONE DAY 2026]",
    artistName: "Pxlhg",
    forumMember: "Pxlhg",
    mediaUrl: "https://www.youtube.com/watch?v=7DpimrqXoL4",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68628/flowers-drone-day-2026",
    embedCode: "https://www.youtube.com/embed/7DpimrqXoL4",
    fetchedAt: "2026-05-30T00:29:08+00:00",
  },
  {
    songTitle: "Using the new \u201crecord in\u201d feature in Outgrowth",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=YwxASXdhoJQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68624/using-the-new-record-in-feature-in-outgrowth",
    embedCode: "https://www.youtube.com/embed/YwxASXdhoJQ",
    fetchedAt: "2026-05-29T15:06:07+00:00",
  },
  {
    songTitle: "The Wagtunes Corner",
    artistName: "wagtunes",
    forumMember: "wagtunes",
    mediaUrl: "https://soundcloud.com/steven-wagenheim/moving-in-the-right-direction",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/66861/the-wagtunes-corner",
    embedCode: "https://w.soundcloud.com/player/?url=https://soundcloud.com/steven-wagenheim/moving-in-the-right-direction&color=ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false",
    fetchedAt: "2026-05-27T19:00:20+00:00",
  },
  {
    songTitle: "My first iPad composition",
    artistName: "Paulieworld",
    forumMember: "Paulieworld",
    mediaUrl: "https://soundcloud.com/paulieworld/take-me-down",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68573/my-first-ipad-composition",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/paulieworld/take-me-down&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-25T13:49:06+00:00",
  },
  {
    songTitle: "Rock|Jazz",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/364-rock-jazz?si=f3c1caf52918429f80dd6466ab39b7d1",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68572/rock-jazz",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/364-rock-jazz?si=f3c1caf52918429f80dd6466ab39b7d1&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-25T13:08:17+00:00",
  },
  {
    songTitle: "Dawn Chorus 4:31 a.m.",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/367-dawn-chorus-4-31-a-m?si=67efd54266eb4fb1a489b02a4412a48f",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68567/dawn-chorus-4-31-a-m",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/367-dawn-chorus-4-31-a-m?si=67efd54266eb4fb1a489b02a4412a48f&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-24T16:49:58+00:00",
  },
  {
    songTitle: "Using two new (to me) apps",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=8nXOagKkfsw",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68564/using-two-new-to-me-apps",
    embedCode: "https://www.youtube.com/embed/8nXOagKkfsw",
    fetchedAt: "2026-05-24T14:34:07+00:00",
  },
  {
    songTitle: "Dogmerica / AI music video promo",
    artistName: "LinearLineman",
    forumMember: "LinearLineman",
    mediaUrl: "https://www.youtube.com/watch?v=pyZI5oM6hWk",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68560/dogmerica-ai-music-video-promo",
    embedCode: "https://www.youtube.com/embed/pyZI5oM6hWk",
    fetchedAt: "2026-05-23T21:22:37+00:00",
  },
  {
    songTitle: "Happy International Synthesizer Day 2026 (Ambient in Koala Sampler)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/B2Drn03QZOGh4pTMe1",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68559/happy-international-synthesizer-day-2026-ambient-in-koala-sampler",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-synth-day-2026%3Fsi%3D0e03d76e6b964d49a81617f658c01d40%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-05-23T19:29:33+00:00",
  },
  {
    songTitle: "Essentia",
    artistName: "pbelgium",
    forumMember: "pbelgium",
    mediaUrl: "https://soundcloud.com/pbelgium8/essentia?si=f9c74a35fed34752be7bcc45e9391bb1",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68555/essentia",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/pbelgium8/essentia?si=f9c74a35fed34752be7bcc45e9391bb1&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-23T14:43:01+00:00",
  },
  {
    songTitle: "Granular Digital Mayhem - Smashing Mashup",
    artistName: "zvon",
    forumMember: "zvon",
    mediaUrl: "https://www.youtube.com/watch?v=nmY1tq_CSxc",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68546/granular-digital-mayhem-smashing-mashup",
    embedCode: "https://www.youtube.com/embed/nmY1tq_CSxc",
    fetchedAt: "2026-05-23T00:49:26+00:00",
  },
  {
    songTitle: "Deep Waters (Solo, Noire, Velvet Guitar, Continua)",
    artistName: "DavidEnglish",
    forumMember: "DavidEnglish",
    mediaUrl: "https://www.youtube.com/watch?v=Bk6nBH_bG2w",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68544/deep-waters-solo-noire-velvet-guitar-continua",
    embedCode: "https://www.youtube.com/embed/Bk6nBH_bG2w",
    fetchedAt: "2026-05-22T17:10:20+00:00",
  },
  {
    songTitle: "JWM's Music May 2026",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/zrEJblzg0W8aYKjgwv",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68333/jwms-music-may-2026",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-shine-the-light%3Fsi%3D20db71941e444a57b2a3a00257eab9d2%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-05-21T22:21:18+00:00",
  },
  {
    songTitle: "Woolgathering",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://www.youtube.com/watch?v=VbrFQOAjb60",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68533/woolgathering",
    embedCode: "https://www.youtube.com/embed/VbrFQOAjb60",
    fetchedAt: "2026-05-20T21:05:33+00:00",
  },
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
    mediaUrl: "https://www.youtube.com/watch?v=R_p3jJVPLyo",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68465/channeling-my-inner-aphex-twin",
    embedCode: "https://www.youtube.com/embed/R_p3jJVPLyo",
    fetchedAt: "2026-05-14T08:22:42+00:00",
  },
  {
    songTitle: "Drone Day 2026 (30 May)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-drone-on-and-on-and-on",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68462/drone-day-2026-30-may",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jwmmakerofmusic/jwm-drone-on-and-on-and-on&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-13T22:59:31+00:00",
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
    songTitle: "Backing Tracks: \"Dark Spacewalk\" in C Lydian (now with flutes added)",
    artistName: "jimhanks",
    forumMember: "jimhanks",
    mediaUrl: "https://www.youtube.com/watch?v=qbqfPtE9o5o",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68434/backing-tracks-dark-spacewalk-in-c-lydian-now-with-flutes-added",
    embedCode: "https://www.youtube.com/embed/qbqfPtE9o5o",
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
    mediaUrl: "https://www.youtube.com/watch?v=wivU7WS81fM",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68267/mojotele65-elet-ojom-s-music-2026",
    embedCode: "https://www.youtube.com/embed/wivU7WS81fM",
    fetchedAt: "2026-04-24T12:21:55+00:00",
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
    songTitle: "A thread of improvised orchestra sketches",
    artistName: "McD",
    forumMember: "McD",
    mediaUrl: "https://soundcloud.com/user-403688328/finger-memory-wav?si=31d45bb007164a7e959ad7601eca8916",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/67823/a-thread-of-improvised-orchestra-sketches",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-403688328/finger-memory-wav?si=31d45bb007164a7e959ad7601eca8916&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
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
