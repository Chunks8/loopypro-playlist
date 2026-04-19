import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import type { InsertTrack } from "@shared/schema";
import * as https from "https";
import * as http from "http";

// Corrected, deduplicated seed tracks — most recent post per thread
const SEED_TRACKS: InsertTrack[] = [
  {
    songTitle: "Ambient Beat Thing",
    artistName: "3108",
    forumMember: "3108",
    mediaUrl: "https://on.soundcloud.com/bu1ZeMjNKGoSKfPH1z",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68207/ambient-beat-thing-electronic-music-in-gadget",
    embedCode: null,
    fetchedAt: "2026-04-18T21:35:42+00:00",
  },
  {
    songTitle: "A new Koala/Outgrowth track",
    artistName: "12843",
    forumMember: "12843",
    mediaUrl: "https://www.youtube.com/watch?v=HgA2mhC1tfo",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68202/a-new-koala-outgrowth-track",
    embedCode: "https://www.youtube.com/embed/HgA2mhC1tfo",
    fetchedAt: "2026-04-18T16:15:45+00:00",
  },
  {
    songTitle: "Soft Breaks",
    artistName: "3108",
    forumMember: "3108",
    mediaUrl: "https://on.soundcloud.com/JC0btMdsZkwsuZ0j7U",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68197/soft-breaks-boc-inspired-piece-of-ambient-in-gadget",
    embedCode: null,
    fetchedAt: "2026-04-18T03:27:11+00:00",
  },
  {
    songTitle: "Tape Test",
    artistName: "3108",
    forumMember: "3108",
    mediaUrl: "https://on.soundcloud.com/UfLiyoWRVQwlll2kW1",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68194/tape-test-a-boc-inspired-ambient-piece-in-korg-gadget",
    embedCode: null,
    fetchedAt: "2026-04-17T17:41:43+00:00",
  },
  {
    songTitle: "Happy to announce Horseflies a new single recording",
    artistName: "10153",
    forumMember: "10153",
    mediaUrl: "https://hearthis.at/frenq/horseflies",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68191/happy-to-announce-horseflies-a-new-single-recording",
    embedCode: null,
    fetchedAt: "2026-04-17T12:59:22+00:00",
  },
  {
    songTitle: "Cosmic ambient in a pop-up void\u2026 \u201cSleeping Through the Apogee\u201d",
    artistName: "7503",
    forumMember: "7503",
    mediaUrl: "https://www.youtube.com/watch?v=AUS_wdpDHfE",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68178/cosmic-ambient-in-a-pop-up-void-sleeping-through-the-apogee",
    embedCode: "https://www.youtube.com/embed/AUS_wdpDHfE",
    fetchedAt: "2026-04-16T08:50:44+00:00",
  },
  {
    songTitle: "The Portrait of a Deranged Mind -something  different from us!",
    artistName: "18417",
    forumMember: "18417",
    mediaUrl: "https://www.youtube.com/watch?v=videoseries",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68166/the-portrait-of-a-deranged-mind-something-different-from-us",
    embedCode: "https://www.youtube.com/embed/videoseries",
    fetchedAt: "2026-04-15T07:25:01+00:00",
  },
  {
    songTitle: "My most recent track",
    artistName: "12542",
    forumMember: "12542",
    mediaUrl: "https://on.soundcloud.com/SJJOnBHE3yGvkNx1gE",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68164/my-most-recent-track",
    embedCode: null,
    fetchedAt: "2026-04-15T03:59:30+00:00",
  },
  {
    songTitle: "The Modern Classic",
    artistName: "3108",
    forumMember: "3108",
    mediaUrl: "https://on.soundcloud.com/aLXxZaDDCvCYo1hgZF",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68160/the-modern-classic-neo-90s-house-in-gadget",
    embedCode: null,
    fetchedAt: "2026-04-14T21:09:17+00:00",
  },
  {
    songTitle: "Greetings from the Cornucopia Sector! Another Exosphere (et al) jam",
    artistName: "6676",
    forumMember: "6676",
    mediaUrl: "https://soundcloud.com/jak_larson/the-cornucopia-sector-node-113",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68159/greetings-from-the-cornucopia-sector-another-exosphere-et-al-jam",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jak_larson/the-cornucopia-sector-node-113&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-14T21:08:32+00:00",
  },
  {
    songTitle: "Power Tends to Corrupt and...",
    artistName: "12242",
    forumMember: "12242",
    mediaUrl: "https://www.youtube.com/watch?v=Gm3DXG5jT3c",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68158/power-tends-to-corrupt-and",
    embedCode: "https://www.youtube.com/embed/Gm3DXG5jT3c",
    fetchedAt: "2026-04-14T19:26:41+00:00",
  },
  {
    songTitle: "Steady As She Blows-Opto Rough Master-126 Bpm",
    artistName: "12542",
    forumMember: "12542",
    mediaUrl: "https://on.soundcloud.com/sTuSa2ioQmquGXCATh",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68157/steady-as-she-blows-opto-rough-master-126-bpm",
    embedCode: null,
    fetchedAt: "2026-04-14T17:32:37+00:00",
  },
  {
    songTitle: "Luc.A - The cave (House in Groove Rider 2)",
    artistName: "22069",
    forumMember: "22069",
    mediaUrl: "https://soundcloud.com/luca_production/the-cave?si=ba86e1e329f3488293625e099b658159",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68156/luc-a-the-cave-house-in-groove-rider-2",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/luca_production/the-cave?si=ba86e1e329f3488293625e099b658159&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-14T16:18:02+00:00",
  },
  {
    songTitle: "Space in the 70\u2019s. A koala ambient thing.",
    artistName: "15259",
    forumMember: "15259",
    mediaUrl: "https://www.youtube.com/watch?v=Jkfd5CgTUGA",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68155/space-in-the-70-s-a-koala-ambient-thing",
    embedCode: "https://www.youtube.com/embed/Jkfd5CgTUGA",
    fetchedAt: "2026-04-14T10:45:43+00:00",
  },
  {
    songTitle: "A Bass Thing",
    artistName: "3108",
    forumMember: "3108",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-a-bass-thing",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68154/a-bass-thing-bass-house-edm-stuff-created-in-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jwmmakerofmusic/jwm-a-bass-thing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-13T21:49:14+00:00",
  },
  {
    songTitle: "Well Considered",
    artistName: "12542",
    forumMember: "12542",
    mediaUrl: "https://on.soundcloud.com/6liFAn6gYRpqltDwMk",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68152/well-considered",
    embedCode: null,
    fetchedAt: "2026-04-13T20:12:08+00:00",
  },
  {
    songTitle: "I, CANNIBAL",
    artistName: "12843",
    forumMember: "12843",
    mediaUrl: "https://www.youtube.com/watch?v=8ZLsGnwhyEw",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68149/i-cannibal",
    embedCode: "https://www.youtube.com/embed/8ZLsGnwhyEw",
    fetchedAt: "2026-04-13T12:51:57+00:00",
  },
  {
    songTitle: "Heavy Lifting - Headphone mix",
    artistName: "12542",
    forumMember: "12542",
    mediaUrl: "https://on.soundcloud.com/Jp89XO4lxCMCQZjbc6",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68142/heavy-lifting-headphone-mix",
    embedCode: null,
    fetchedAt: "2026-04-13T02:20:03+00:00",
  },
  {
    songTitle: "'Going Home' another new blues recording in collab with pbelgium",
    artistName: "10153",
    forumMember: "10153",
    mediaUrl: "https://hearthis.at/frenq/going-home",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68140/going-home-another-new-blues-recording-in-collab-with-pbelgium",
    embedCode: null,
    fetchedAt: "2026-04-12T19:47:13+00:00",
  },
  {
    songTitle: "@egobeats favorite \ud83d\ude42",
    artistName: "12843",
    forumMember: "12843",
    mediaUrl: "https://www.youtube.com/watch?v=_sBlmfP15CM",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68133/egobeats-favorite",
    embedCode: "https://www.youtube.com/embed/_sBlmfP15CM",
    fetchedAt: "2026-04-12T02:22:13+00:00",
  },
  {
    songTitle: "JWM - Bored Beat (TripHop inspired by BoC done in Gadget)",
    artistName: "3108",
    forumMember: "3108",
    mediaUrl: "https://www.youtube.com/watch?v=c3RGBN8b19Y",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68131/jwm-bored-beat-triphop-inspired-by-boc-done-in-gadget",
    embedCode: "https://www.youtube.com/embed/c3RGBN8b19Y",
    fetchedAt: "2026-04-11T15:52:29+00:00",
  },
  {
    songTitle: "JWM - Exceeding Expectations (Electro-House in Auxy Studio)",
    artistName: "3108",
    forumMember: "3108",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-exceeding-expectations",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68123/jwm-exceeding-expectations-electro-house-in-auxy-studio",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jwmmakerofmusic/jwm-exceeding-expectations&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-11T01:51:40+00:00",
  },
  {
    songTitle: "A weird one",
    artistName: "12843",
    forumMember: "12843",
    mediaUrl: "https://www.youtube.com/watch?v=xcd14C9z9FI",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68122/a-weird-one",
    embedCode: "https://www.youtube.com/embed/xcd14C9z9FI",
    fetchedAt: "2026-04-11T00:55:03+00:00",
  },
  {
    songTitle: "Drifting (Intimate Cello, Vital Series: Mallets, Velvet Guitar, Noire, Solo, Continua)",
    artistName: "3962",
    forumMember: "3962",
    mediaUrl: "https://www.youtube.com/watch?v=6zHWMjZeCoo",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68116/drifting-intimate-cello-vital-series-mallets-velvet-guitar-noire-solo-continua",
    embedCode: "https://www.youtube.com/embed/6zHWMjZeCoo",
    fetchedAt: "2026-04-10T17:11:11+00:00",
  },
  {
    songTitle: "bygones",
    artistName: "12843",
    forumMember: "12843",
    mediaUrl: "https://www.youtube.com/watch?v=N2_sN2N3e9I",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68112/bygones",
    embedCode: "https://www.youtube.com/embed/N2_sN2N3e9I",
    fetchedAt: "2026-04-10T02:16:53+00:00",
  },
  {
    songTitle: "JWM - Vortex (2010s Brostep in Korg Gadget 3)",
    artistName: "3108",
    forumMember: "3108",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-vortex",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68111/jwm-vortex-2010s-brostep-in-korg-gadget-3",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jwmmakerofmusic/jwm-vortex&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-10T01:28:50+00:00",
  },
  {
    songTitle: "First track in awhile.",
    artistName: "12542",
    forumMember: "12542",
    mediaUrl: "https://on.soundcloud.com/qkTzLlb04Mpld4dXjV",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68108/first-track-in-awhile",
    embedCode: null,
    fetchedAt: "2026-04-09T17:22:47+00:00",
  },
  {
    songTitle: "MIDNIGHT BLUES a new recording in collab with pbelgium",
    artistName: "10153",
    forumMember: "10153",
    mediaUrl: "https://hearthis.at/frenq/midnight-blues",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68072/midnight-blues-a-new-recording-in-collab-with-pbelgium",
    embedCode: null,
    fetchedAt: "2026-04-06T06:47:37+00:00",
  },
  {
    songTitle: "Bowling Ball and Feather",
    artistName: "19725",
    forumMember: "19725",
    mediaUrl: "https://www.youtube.com/watch?v=YzB9YTnKLHE",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68061/bowling-ball-and-feather",
    embedCode: "https://www.youtube.com/embed/YzB9YTnKLHE",
    fetchedAt: "2026-04-04T02:37:36+00:00",
  },
  {
    songTitle: "Song Of The Month Club - April 2026",
    artistName: "2834",
    forumMember: "2834",
    mediaUrl: "https://soundcloud.com/richardyot/a-moth-to-flame",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68044/song-of-the-month-club-april-2026",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/richardyot/a-moth-to-flame&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-04-02T15:25:47+00:00",
  },
  {
    songTitle: "Lucid Dreaming with Exosphere and VS2",
    artistName: "6676",
    forumMember: "6676",
    mediaUrl: "https://www.youtube.com/watch?v=h4f7LWD8hes",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68040/lucid-dreaming-with-exosphere-and-vs2",
    embedCode: "https://www.youtube.com/embed/h4f7LWD8hes",
    fetchedAt: "2026-04-02T10:41:08+00:00",
  },
  {
    songTitle: "Goodbye Pork Pie Town",
    artistName: "15450",
    forumMember: "15450",
    mediaUrl: "https://soundcloud.com/geotony/360-goodbye-pork-pie-town?si=dfec9858e91143e0814c51f0abe70978",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68013/goodbye-pork-pie-town",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/geotony/360-goodbye-pork-pie-town?si=dfec9858e91143e0814c51f0abe70978&amp;utm_source=clipboard&amp;utm_medium=text&amp;utm_campaign=social_sharing&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-03-30T19:14:53+00:00",
  },
  {
    songTitle: "JWM - Reggaeton Trance 032626 (Instrumental done in FL Studio Mobile)",
    artistName: "3108",
    forumMember: "3108",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-reggaeton-trance-032626",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68003/jwm-reggaeton-trance-032626-instrumental-done-in-fl-studio-mobile",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jwmmakerofmusic/jwm-reggaeton-trance-032626&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-03-29T23:47:40+00:00",
  },
  {
    songTitle: "Song Of The Month Club - March 2026",
    artistName: "2834",
    forumMember: "2834",
    mediaUrl: "https://soundcloud.com/richardyot/the-way-you-are",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/67773/song-of-the-month-club-march-2026",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/richardyot/the-way-you-are&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2026-03-02T12:37:50+00:00",
  },
  {
    songTitle: "The Wagtunes Corner",
    artistName: "22715",
    forumMember: "22715",
    mediaUrl: "https://soundcloud.com/steven-wagenheim/crazy-love",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/66861/the-wagtunes-corner",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/steven-wagenheim/crazy-love&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false",
    fetchedAt: "2025-12-04T14:10:25+00:00",
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
