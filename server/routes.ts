import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import type { InsertTrack } from "@shared/schema";
import * as https from "https";
import * as http from "http";

// Corrected, deduplicated seed tracks — most recent post per thread
const SEED_TRACKS: InsertTrack[] = [
  {
    songTitle: "Sleeping Through the Apogee",
    artistName: "Starship Relic",
    forumMember: "wired2moon",
    mediaUrl: "https://www.youtube.com/watch?v=AUS_wdpDHfE",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68178/cosmic-ambient-in-a-pop-up-void-sleeping-through-the-apogee",
    embedCode: "https://www.youtube.com/embed/AUS_wdpDHfE",
    fetchedAt: "2026-04-16T00:00:00.000Z",
  },
  {
    songTitle: "Kire - Opto Rough Master 89 Bpm",
    artistName: "ModernDayBlue, Gravitas, Ishmael Pamphille",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/SJJOnBHE3yGvkNx1gE",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68164/my-most-recent-track",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2005081043&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-15T00:00:00.000Z",
  },
  {
    songTitle: "The Portrait of a Deranged Mind",
    artistName: "Fear 2 Stop",
    forumMember: "Fear2Stop",
    mediaUrl: "https://www.youtube.com/watch?v=62Up8O85fco",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68166/the-portrait-of-a-deranged-mind-something-different-from-us",
    embedCode: "https://www.youtube.com/embed/62Up8O85fco",
    fetchedAt: "2026-04-15T00:00:00.000Z",
  },
  {
    songTitle: "The cave",
    artistName: "Luc.A",
    forumMember: "Luc_A",
    mediaUrl: "https://soundcloud.com/luca_production/the-cave",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68156/luc-a-the-cave-house-in-groove-rider-2",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2302491833&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-14T00:00:00.000Z",
  },
  {
    songTitle: "The Modern Classic",
    artistName: "JWM",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-the-modern-classic",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68160/the-modern-classic-neo-90s-house-in-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2302653500&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-14T00:00:00.000Z",
  },
  {
    songTitle: "Power Tends to Corrupt and...",
    artistName: "zvon",
    forumMember: "zvon",
    mediaUrl: "https://www.youtube.com/watch?v=Gm3DXG5jT3c",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68158/power-tends-to-corrupt-and",
    embedCode: "https://www.youtube.com/embed/Gm3DXG5jT3c",
    fetchedAt: "2026-04-14T00:00:00.000Z",
  },
  {
    songTitle: "Space in the 70s",
    artistName: "sevenape",
    forumMember: "sevenape",
    mediaUrl: "https://www.youtube.com/watch?v=Jkfd5CgTUGA",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68155/space-in-the-70-s-a-koala-ambient-thing",
    embedCode: "https://www.youtube.com/embed/Jkfd5CgTUGA",
    fetchedAt: "2026-04-14T00:00:00.000Z",
  },
  {
    songTitle: "The Cornucopia Sector - Node 113",
    artistName: "jak_larson",
    forumMember: "id_23",
    mediaUrl: "https://soundcloud.com/jak_larson/the-cornucopia-sector-node-113",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68159/greetings-from-the-cornucopia-sector-another-exosphere-et-al-jam",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2302651313&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-14T00:00:00.000Z",
  },
  {
    songTitle: "Steady As She Blows - Opto Rough Master 126 Bpm",
    artistName: "ModernDayBlue, Gravitas, Ishmael Pamphille",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/sTuSa2ioQmquGXCATh",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68157/steady-as-she-blows-opto-rough-master-126-bpm",
    embedCode: null,
    fetchedAt: "2026-04-14T00:00:00.000Z",
  },
  {
    // I, CANNIBAL — most recent is the reimagined version by rottencat
    songTitle: "m3llhopiates reimagined",
    artistName: "Yvonne Dickerson",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=8ZLsGnwhyEw",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68149/i-cannibal",
    embedCode: "https://www.youtube.com/embed/8ZLsGnwhyEw",
    fetchedAt: "2026-04-13T00:00:00.000Z",
  },
  {
    songTitle: "A Bass Thing",
    artistName: "JWM",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-a-bass-thing",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68154/a-bass-thing-bass-house-edm-stuff-created-in-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2302040891&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-13T00:00:00.000Z",
  },
  {
    songTitle: "Well Considered 139 Opto Rough Master",
    artistName: "ModernDayBlue, Gravitas, Ishmael Pamphille",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/6liFAn6gYRpqltDwMk",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68152/well-considered",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2006764511&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-13T00:00:00.000Z",
  },
  {
    songTitle: "Heavy Lifting - Opto Mix - Rough Mix",
    artistName: "ModernDayBlue, Gravitas, Ishmael Pamphille",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/Jp89XO4lxCMCQZjbc6",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68142/heavy-lifting-headphone-mix",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2004245711&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-13T00:00:00.000Z",
  },
  {
    songTitle: "Going Home",
    artistName: "Frenq & pbelgium",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/going-home/",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68140/going-home-another-new-blues-recording-in-collab-with-pbelgium",
    embedCode: "https://app.hearthis.at/embed/14147295/transparent_black/?",
    fetchedAt: "2026-04-12T00:00:00.000Z",
  },
  {
    songTitle: "inverse",
    artistName: "Yvonne Dickerson",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=xcd14C9z9FI",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68122/a-weird-one",
    embedCode: "https://www.youtube.com/embed/xcd14C9z9FI",
    fetchedAt: "2026-04-11T00:00:00.000Z",
  },
  {
    songTitle: "Exceeding Expectations",
    artistName: "JWM",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-exceeding-expectations",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68123/jwm-exceeding-expectations-electro-house-in-auxy-studio",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2300513741&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-11T00:00:00.000Z",
  },
  {
    songTitle: "JWM - Bored Beat",
    artistName: "JWM",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-bored-beat",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68131/jwm-bored-beat-triphop-inspired-by-boc-done-in-gadget",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2300772461&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-11T00:00:00.000Z",
  },
  {
    songTitle: "bygones",
    artistName: "Yvonne Dickerson",
    forumMember: "rottencat",
    mediaUrl: "https://www.youtube.com/watch?v=N2_sN2N3e9I",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68112/bygones",
    embedCode: "https://www.youtube.com/embed/N2_sN2N3e9I",
    fetchedAt: "2026-04-10T00:00:00.000Z",
  },
  {
    songTitle: "Drifting",
    artistName: "DavidEnglish",
    forumMember: "DavidEnglish",
    mediaUrl: "https://www.youtube.com/watch?v=6zHWMjZeCoo",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68116/drifting-intimate-cello-vital-series-mallets-velvet-guitar-noire-solo-continua",
    embedCode: "https://www.youtube.com/embed/6zHWMjZeCoo",
    fetchedAt: "2026-04-10T00:00:00.000Z",
  },
  {
    songTitle: "JWM - Vortex",
    artistName: "JWMMakerofMusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-vortex",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68111/jwm-vortex-2010s-brostep-in-korg-gadget-3",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2299896635&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-10T00:00:00.000Z",
  },
  {
    songTitle: "Shango Master Opto Mix Rough - 130 Bpm",
    artistName: "ModernDayBlue, Gravitas, Ishmael Pamphille",
    forumMember: "Gravitas",
    mediaUrl: "https://on.soundcloud.com/qkTzLlb04Mpld4dXjV",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68108/first-track-in-awhile",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1798365613&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-09T00:00:00.000Z",
  },
  {
    songTitle: "Samsara",
    artistName: "Svetlovska",
    forumMember: "Svetlovska",
    mediaUrl: "https://soundcloud.com/irena-svetlovska/samsara",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68091/first-go-with-16-drones-midnight-plaza-samsara",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2298644012&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-04-08T00:00:00.000Z",
  },
  {
    songTitle: "MIDNIGHT BLUES",
    artistName: "Frenq & pbelgium",
    forumMember: "Frenq",
    mediaUrl: "https://hearthis.at/frenq/midnight-blues/",
    mediaType: "hearthis",
    threadUrl: "https://forum.loopypro.com/discussion/68072/midnight-blues-a-new-recording-in-collab-with-pbelgium",
    embedCode: "https://app.hearthis.at/embed/14147295/transparent_black/?",
    fetchedAt: "2026-04-06T00:00:00.000Z",
  },
  {
    songTitle: "Bowling Ball and Feather",
    artistName: "Warm Tubes",
    forumMember: "tubespace",
    mediaUrl: "https://www.youtube.com/watch?v=YzB9YTnKLHE",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68061/bowling-ball-and-feather",
    embedCode: "https://www.youtube.com/embed/YzB9YTnKLHE",
    fetchedAt: "2026-04-04T00:00:00.000Z",
  },
  {
    // Song of Month April — most recent reply track
    songTitle: "Happy Ending (Soul Disco Mix)",
    artistName: "Darren Studholme",
    forumMember: "studs1966",
    mediaUrl: "https://www.youtube.com/watch?v=urV40edF9sY",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68044/song-of-the-month-club-april-2026",
    embedCode: "https://www.youtube.com/embed/urV40edF9sY",
    fetchedAt: "2026-04-02T00:00:00.000Z",
  },
  {
    songTitle: "Lucid Dreaming",
    artistName: "ID 23",
    forumMember: "id_23",
    mediaUrl: "https://www.youtube.com/watch?v=h4f7LWD8hes",
    mediaType: "youtube",
    threadUrl: "https://forum.loopypro.com/discussion/68040/lucid-dreaming-with-exosphere-and-vs2",
    embedCode: "https://www.youtube.com/embed/h4f7LWD8hes",
    fetchedAt: "2026-04-02T00:00:00.000Z",
  },
  {
    songTitle: "Goodbye Pork Pie Town",
    artistName: "GeoTony",
    forumMember: "GeoTony",
    mediaUrl: "https://soundcloud.com/geotony/360-goodbye-pork-pie-town",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68013/goodbye-pork-pie-town",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2293513082&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-03-30T00:00:00.000Z",
  },
  {
    songTitle: "JWM - Reggaeton Trance 032626",
    artistName: "JWMMakerofMusic",
    forumMember: "jwmmakerofmusic",
    mediaUrl: "https://soundcloud.com/jwmmakerofmusic/jwm-reggaeton-trance-032626",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/68003/jwm-reggaeton-trance-032626-instrumental-done-in-fl-studio-mobile",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2292958343&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-03-29T00:00:00.000Z",
  },
  {
    // Song of Month March — most recent reply track
    songTitle: "Not The Girl You Used To Love",
    artistName: "Steven Wagenheim",
    forumMember: "wagtunes",
    mediaUrl: "https://soundcloud.com/steven-wagenheim/not-the-girl-you-used-to-love",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/67773/song-of-the-month-club-march-2026",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2303650415&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2026-03-02T00:00:00.000Z",
  },
  {
    // Wagtunes Corner — most recent (same track as March SOTM, but different thread, use once)
    songTitle: "Not The Girl You Used To Love",
    artistName: "Steven Wagenheim",
    forumMember: "wagtunes",
    mediaUrl: "https://soundcloud.com/steven-wagenheim/not-the-girl-you-used-to-love",
    mediaType: "soundcloud",
    threadUrl: "https://forum.loopypro.com/discussion/66861/the-wagtunes-corner",
    embedCode: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2303650415&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false",
    fetchedAt: "2025-12-04T00:00:00.000Z",
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
