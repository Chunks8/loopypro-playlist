import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import type { InsertTrack } from "@shared/schema";
import * as https from "https";
import * as http from "http";

// Corrected, deduplicated seed tracks — most recent post per thread
const SEED_TRACKS: InsertTrack[] = [
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
    songTitle: "Korg Gadget LE Challenge, 2026 Edition",
    artistName: "jwmmakerofmusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://on.soundcloud.com/EDUwVVGE6mrNixvipO",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68215/korg-gadget-le-challenge-2026-edition",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fjwmmakerofmusic%2Fjwm-korg-le-challenge-2026%3Fsi%3D4d0bef713af140f4a340c57873b51074%26utm_source%3Dclipboard%26utm_medium%3Dtext%26utm_campaign%3Dsocial_sharing&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-19T20:05:03+00:00",
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
    songTitle: "The Wagtunes Corner",
    artistName: "wagtunes",
    forumMember: "wagtunes",
    mediaUrl: "https://soundcloud.com/steven-wagenheim/not-the-girl-you-used-to-love",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/66861/the-wagtunes-corner",
    embedCode: "https://w.soundcloud.com/player/?url=https://soundcloud.com/steven-wagenheim/not-the-girl-you-used-to-love&color=ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false",
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
