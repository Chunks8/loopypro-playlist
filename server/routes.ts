import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import type { InsertTrack } from "@shared/schema";
import * as https from "https";
import * as http from "http";

// Corrected, deduplicated seed tracks — most recent post per thread
const SEED_TRACKS: InsertTrack[] = [
  {
    songTitle: "Fantasy for Cello",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/370-fantasy-for-cello?si=b52c7eed57df4ac1b52ac1bb2875ed67",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68834/fantasy-for-cello",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/370-fantasy-for-cello?si=b52c7eed57df4ac1b52ac1bb2875ed67&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-06-22T18:25:34+00:00",
  },
  {
    songTitle: "JWM's Music Journal June 2026",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/NU8DOwrof7VseQtbiM",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68718/jwms-music-journal-june-2026",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-the-experience-2026%3Fsi%3D1973817d2bce49c39ce266e88b4f3de2%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-06-22T17:26:34+00:00",
  },
  {
    songTitle: "Sound of Silence - acoustic cover",
    artistName: "richardyot",
    forumMember: "richardyot",
    mediaUrl: "https://www.youtube.com/watch?v=nZivseZxMEM",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68830/sound-of-silence-acoustic-cover",
    embedCode: "https://www.youtube.com/embed/nZivseZxMEM",
    fetchedAt: "2026-06-22T10:40:20+00:00",
  },
  {
    songTitle: "Using Chromosonic as a sequencer",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=uqfjkEQMoeQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68828/using-chromosonic-as-a-sequencer",
    embedCode: "https://www.youtube.com/embed/uqfjkEQMoeQ",
    fetchedAt: "2026-06-21T21:10:12+00:00",
  },
  {
    songTitle: "Red Toy Keyboard Springs sample set",
    artistName: "zvon",
    forumMember: "zvon",
    mediaUrl: "https://www.youtube.com/watch?v=Xr2pulioMks",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68827/red-toy-keyboard-springs-sample-set",
    embedCode: "https://www.youtube.com/embed/Xr2pulioMks",
    fetchedAt: "2026-06-21T19:14:31+00:00",
  },
  {
    songTitle: "Luc.A - That beat (Tech house in Korg Gadget 3)",
    artistName: "Luc_A",
    forumMember: "Luc_A",
    mediaUrl: "https://soundcloud.com/luca_production/that-beat?si=01ca63d2fbe4410eaa8cf0a77ca465e5",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68825/luc-a-that-beat-tech-house-in-korg-gadget-3",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/luca_production/that-beat?si=01ca63d2fbe4410eaa8cf0a77ca465e5&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-06-21T16:48:19+00:00",
  },
  {
    songTitle: "A New You! Koala ambient thing",
    artistName: "sevenape",
    forumMember: "sevenape",
    mediaUrl: "https://www.youtube.com/watch?v=z7ZDrvIAgr4",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68821/a-new-you-koala-ambient-thing",
    embedCode: "https://www.youtube.com/embed/z7ZDrvIAgr4",
    fetchedAt: "2026-06-21T12:35:10+00:00",
  },
  {
    songTitle: "undergrowth",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=ub7Q0DRTJn0",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68806/undergrowth",
    embedCode: "https://www.youtube.com/embed/ub7Q0DRTJn0",
    fetchedAt: "2026-06-19T21:41:28+00:00",
  },
  {
    songTitle: "Between (Vital Series: Mallets, Solo, Noire, Omnisphere, Continua)",
    artistName: "DavidEnglish",
    forumMember: "DavidEnglish",
    mediaUrl: "https://www.youtube.com/watch?v=gQmrxuw93Ks",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68803/between-vital-series-mallets-solo-noire-omnisphere-continua",
    embedCode: "https://www.youtube.com/embed/gQmrxuw93Ks",
    fetchedAt: "2026-06-19T17:15:38+00:00",
  },
  {
    songTitle: "Live Band Trio In a Boiler Room (House music)... Part 2",
    artistName: "Etienne",
    forumMember: "Etienne",
    mediaUrl: "https://www.youtube.com/watch?v=sDeOdcPxH8U",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68801/live-band-trio-in-a-boiler-room-house-music-part-2",
    embedCode: "https://www.youtube.com/embed/sDeOdcPxH8U",
    fetchedAt: "2026-06-19T16:12:17+00:00",
  },
  {
    songTitle: "The road to Wigtwizzle",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/369-the-road-to-wigtwizzle?si=a396ead3f278481da71259bffc92023d",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68799/the-road-to-wigtwizzle",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/369-the-road-to-wigtwizzle?si=a396ead3f278481da71259bffc92023d&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-06-19T14:53:38+00:00",
  },
  {
    songTitle: "JWM - \"The Geometry of Summer\" (BoC-inspired EP)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/pWYi26DeluodXShIv4",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68796/jwm-the-geometry-of-summer-boc-inspired-ep",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-the-geometry-of-summer-ep%3Fsi%3De013f1de1970486281393aae245ed9f3%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-06-19T01:29:19+00:00",
  },
  {
    songTitle: "\"Electronic Horizons EP\" (Various Electronic Genres)",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/AO4V8V5ISGJNxE4gZK",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68785/electronic-horizons-ep-various-electronic-genres",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-electronic-horizons-ep%3Fsi%3D3b24db913bfa4f25a71f7725bcf69867%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-06-18T03:00:05+00:00",
  },
  {
    songTitle: "Ambiotica Sound Demo | No Talking just playing",
    artistName: "TheAudioDabbler",
    forumMember: "TheAudioDabbler",
    mediaUrl: "https://www.youtube.com/watch?v=-Z34ixpbIk0",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68781/ambiotica-sound-demo-no-talking-just-playing",
    embedCode: "https://www.youtube.com/embed/-Z34ixpbIk0",
    fetchedAt: "2026-06-17T15:23:49+00:00",
  },
  {
    songTitle: "Finally done my new EP 'Nightbound Frequencies'",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68779/finally-done-my-new-ep-nightbound-frequencies",
    embedCode: null,
    fetchedAt: "2026-06-17T12:03:10+00:00",
  },
  {
    songTitle: "Amalgam [iPad only album]",
    artistName: "unlink",
    forumMember: "unlink",
    mediaUrl: "https://www.youtube.com/watch?v=Ufrck-GY3rQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68760/amalgam-ipad-only-album",
    embedCode: "https://www.youtube.com/embed/Ufrck-GY3rQ",
    fetchedAt: "2026-06-15T16:14:08+00:00",
  },
  {
    songTitle: "Vocals only",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=15GPMs6pxlw",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68759/vocals-only",
    embedCode: "https://www.youtube.com/embed/15GPMs6pxlw",
    fetchedAt: "2026-06-15T15:27:13+00:00",
  },
  {
    songTitle: "Water",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://www.youtube.com/watch?v=oYp6C2_SJus",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68754/water",
    embedCode: "https://www.youtube.com/embed/oYp6C2_SJus",
    fetchedAt: "2026-06-14T20:39:09+00:00",
  },
  {
    songTitle: "Two Chords No Waiting",
    artistName: "Paulieworld",
    forumMember: "Paulieworld",
    mediaUrl: "https://soundcloud.com/paulieworld/two-chords-no-waiting",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68752/two-chords-no-waiting",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/paulieworld/two-chords-no-waiting&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-06-14T15:07:11+00:00",
  },
  {
    songTitle: "Summer time new pickups new jams",
    artistName: "Jmd8928",
    forumMember: "Jmd8928",
    mediaUrl: "https://on.soundcloud.com/XWA5v9zvANRF2812it",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68738/summer-time-new-pickups-new-jams",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjimmyjam8928%2Fsurmmer-days-wav%3Fref%3Dclipboard%26p%3Di%26c%3D1%26si%3D2AE77BF48DF34864873F89321C393700%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-06-13T00:39:34+00:00",
  },
  {
    songTitle: "The new Drone Meditations app",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=mMh83ybQSzQ",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68734/the-new-drone-meditations-app",
    embedCode: "https://www.youtube.com/embed/mMh83ybQSzQ",
    fetchedAt: "2026-06-12T17:39:31+00:00",
  },
  {
    songTitle: "You're Just Not Like That Babe - a collab with Unlink and Jankun",
    artistName: "richardyot",
    forumMember: "richardyot",
    mediaUrl: "https://soundcloud.com/richardyot/youre-just-not-like-that-babe",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68731/youre-just-not-like-that-babe-a-collab-with-unlink-and-jankun",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/richardyot/youre-just-not-like-that-babe&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-06-12T09:20:35+00:00",
  },
  {
    songTitle: "Sonic Vignette 113 - Toughest Spot Ever",
    artistName: "zvon",
    forumMember: "zvon",
    mediaUrl: "https://www.youtube.com/watch?v=gf3onZ6DcLA",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68710/sonic-vignette-113-toughest-spot-ever",
    embedCode: "https://www.youtube.com/embed/gf3onZ6DcLA",
    fetchedAt: "2026-06-09T19:55:05+00:00",
  },
  {
    songTitle: "New underground-rock single recording ''Slipped Away\"",
    artistName: "Frenq",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/slippedaway",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68708/new-underground-rock-single-recording-slipped-away",
    embedCode: "https://app.hearthis.at/embed/14466504/transparent_black/?",
    fetchedAt: "2026-06-09T13:34:55+00:00",
  },
  {
    songTitle: "I wanted to use my new Pro-A5\u2026",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=bWvsWguBu8E",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68693/i-wanted-to-use-my-new-pro-a5",
    embedCode: "https://www.youtube.com/embed/bWvsWguBu8E",
    fetchedAt: "2026-06-06T22:22:34+00:00",
  },
  {
    songTitle: "5 8 7 9 8 1 2  (Pbelgium and Paulieworld)",
    artistName: "Paulieworld",
    forumMember: "Paulieworld",
    mediaUrl: "https://soundcloud.com/paulieworld/5-8-7-9-8-1-2",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68691/5-8-7-9-8-1-2-pbelgium-and-paulieworld",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/paulieworld/5-8-7-9-8-1-2&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-06-06T17:10:05+00:00",
  },
  {
    songTitle: "Autumn Afternoon (Intimate Violin, Solo, Noire, Velvet Guitar, Continua)",
    artistName: "DavidEnglish",
    forumMember: "DavidEnglish",
    mediaUrl: "https://www.youtube.com/watch?v=T-kMtn37guA",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68687/autumn-afternoon-intimate-violin-solo-noire-velvet-guitar-continua",
    embedCode: "https://www.youtube.com/embed/T-kMtn37guA",
    fetchedAt: "2026-06-05T17:40:25+00:00",
  },
  {
    songTitle: "Dogmerica: chapter 1, Humanity Vanishes",
    artistName: "LinearLineman",
    forumMember: "LinearLineman",
    mediaUrl: "https://www.youtube.com/watch?v=BzPC_b-1eis",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68681/dogmerica-chapter-1-humanity-vanishes",
    embedCode: "https://www.youtube.com/embed/BzPC_b-1eis",
    fetchedAt: "2026-06-04T13:35:11+00:00",
  },
  {
    songTitle: "Dark Psychedelic Ambient Beats with Exosphere & Battalion etc.",
    artistName: "id_23",
    forumMember: "id_23",
    mediaUrl: "https://www.youtube.com/watch?v=MM9-ura9CYc",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68672/dark-psychedelic-ambient-beats-with-exosphere-battalion-etc",
    embedCode: "https://www.youtube.com/embed/MM9-ura9CYc",
    fetchedAt: "2026-06-04T08:44:52+00:00",
  },
  {
    songTitle: "A lovely Mozaic patch",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=4E2S6pUt--o",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68668/a-lovely-mozaic-patch",
    embedCode: "https://www.youtube.com/embed/4E2S6pUt--o",
    fetchedAt: "2026-06-04T00:12:46+00:00",
  },
  {
    songTitle: "Threatening Rain",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/368-threatening-rain?in=geotony/sets/2026-tracks",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68657/threatening-rain",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/368-threatening-rain?in=geotony/sets/2026-tracks&amp;si=f6758c0eb5d341a3915bcaf610f18771&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-06-02T19:59:02+00:00",
  },
  {
    songTitle: "The Wagtunes Corner",
    artistName: "wagtunes",
    forumMember: "wagtunes",
    mediaUrl: "https://soundcloud.com/steven-wagenheim/thats-the-way-it-always-ends",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/66861/the-wagtunes-corner",
    embedCode: "https://w.soundcloud.com/player/?url=https://soundcloud.com/steven-wagenheim/thats-the-way-it-always-ends&color=ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false",
    fetchedAt: "2026-06-02T19:52:59+00:00",
  },
  {
    songTitle: "A lot of drones around here lately",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=h2ZVh6mKyC0",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68642/a-lot-of-drones-around-here-lately",
    embedCode: "https://www.youtube.com/embed/h2ZVh6mKyC0",
    fetchedAt: "2026-05-31T18:34:24+00:00",
  },
  {
    songTitle: "JWM's Music May 2026",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/1Y9nUbORITpnUsaNJj",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68333/jwms-music-may-2026",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-meanwhile-in-canada%3Fsi%3Da66af8abbe14497cb75bf4dd712d3f49%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-05-31T01:53:41+00:00",
  },
  {
    songTitle: "Album Release: \"Kiku Dreams: Flukutronic 3\"",
    artistName: "jimhanks",
    forumMember: "jimhanks",
    mediaUrl: "https://www.youtube.com/watch?v=_GtvbEFH5SU",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68635/album-release-kiku-dreams-flukutronic-3",
    embedCode: "https://www.youtube.com/embed/_GtvbEFH5SU",
    fetchedAt: "2026-05-30T15:56:39+00:00",
  },
  {
    songTitle: "In My Heart Remix",
    artistName: "Paulieworld",
    forumMember: "Paulieworld",
    mediaUrl: "https://soundcloud.com/paulieworld/in-my-heart-remix",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68634/in-my-heart-remix",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/paulieworld/in-my-heart-remix&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-05-30T14:34:20+00:00",
  },
  {
    songTitle: "Hammering Past The Stop - Omnivocal, SWAM, StaffPad, Cubasis, Cubase",
    artistName: "AndyHoneybone",
    forumMember: "AndyHoneybone",
    mediaUrl: "https://on.soundcloud.com/Pvb3Drb54iwowFjA1P",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68633/hammering-past-the-stop-omnivocal-swam-staffpad-cubasis-cubase",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fandyhoneybone%2Fhammering-past-the-stop-1%3Futm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing%26si%3Dd06b11032da14157818656ef7694f4da&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-05-30T14:27:21+00:00",
  },
  {
    songTitle: "Happy Drone Day!",
    artistName: "rottencat",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=LVSMOHV7ELY",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68631/happy-drone-day",
    embedCode: "https://www.youtube.com/embed/LVSMOHV7ELY",
    fetchedAt: "2026-05-30T12:29:38+00:00",
  },
  {
    songTitle: "Ambient improvisation.",
    artistName: "flo",
    forumMember: "flo",
    mediaUrl: "https://www.youtube.com/watch?v=R8ZhnncM1B0",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68629/ambient-improvisation",
    embedCode: "https://www.youtube.com/embed/R8ZhnncM1B0",
    fetchedAt: "2026-05-30T10:47:08+00:00",
  },
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
    songTitle: "\"1 week - 1 minute\" challenge",
    artistName: "vlaoladis",
    forumMember: "vlaoladis",
    mediaUrl: "https://www.youtube.com/watch?v=QQTjTgEMIGg",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68500/1-week-1-minute-challenge",
    embedCode: "https://www.youtube.com/embed/QQTjTgEMIGg",
    fetchedAt: "2026-05-17T21:35:08+00:00",
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
    songTitle: "June update: lukesleepwalker\u2019s 2026 resolution: a track a month",
    artistName: "lukesleepwalker",
    forumMember: "lukesleepwalker",
    mediaUrl: "https://soundcloud.com/lukesleepwalker-1/june-wav",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/67430/june-update-lukesleepwalker-s-2026-resolution-a-track-a-month",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lukesleepwalker-1/june-wav&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-01-28T15:18:52+00:00",
  },
  {
    songTitle: "5 ate 7, 7 ate 9 - Acoustic Guitar Loop for Collaboration",
    artistName: "pbelgium",
    forumMember: "pbelgium",
    mediaUrl: "https://www.youtube.com/watch?v=m78o2mPSR9s",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/66105/5-ate-7-7-ate-9-acoustic-guitar-loop-for-collaboration",
    embedCode: "https://www.youtube.com/embed/m78o2mPSR9s",
    fetchedAt: "2025-09-23T15:06:26+00:00",
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
