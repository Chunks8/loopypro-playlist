import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { tracks, type Track, type InsertTrack } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const sqlite = new Database("radio.db");
const db = drizzle(sqlite);

// Create table if not exists
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    forum_member TEXT NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL,
    thread_url TEXT NOT NULL,
    embed_code TEXT,
    fetched_at TEXT NOT NULL
  )
`);

export interface IStorage {
  getAllTracks(): Track[];
  replaceAllTracks(newTracks: InsertTrack[]): Track[];
  getLastFetchedAt(): string | null;
}

export const storage: IStorage = {
  getAllTracks(): Track[] {
    return db.select().from(tracks).orderBy(desc(tracks.id)).all();
  },

  replaceAllTracks(newTracks: InsertTrack[]): Track[] {
    sqlite.exec("DELETE FROM tracks");
    if (newTracks.length === 0) return [];
    for (const t of newTracks) {
      db.insert(tracks).values(t).run();
    }
    return db.select().from(tracks).all();
  },

  getLastFetchedAt(): string | null {
    const row = db.select().from(tracks).get();
    return row?.fetchedAt ?? null;
  },
};
