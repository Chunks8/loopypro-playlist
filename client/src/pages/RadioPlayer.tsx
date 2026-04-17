import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Track } from "@shared/schema";

// ── SC Widget API types ───────────────────────────────────────────────────────
declare global {
  interface Window {
    SC: any;
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/) || url.match(/embed\/([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

function mediaTypeLabel(type: string) {
  if (type === "soundcloud") return "SoundCloud";
  if (type === "youtube") return "YouTube";
  if (type === "hearthis") return "HearThis";
  return type;
}

function getDirectUrl(track: Track): string {
  if (track.mediaType === "youtube") {
    const vid = getYouTubeId(track.embedCode ?? track.mediaUrl);
    return vid ? `https://www.youtube.com/watch?v=${vid}` : track.mediaUrl;
  }
  return track.mediaUrl;
}

function getSCEmbedUrl(track: Track): string | null {
  if (track.mediaType !== "soundcloud") return null;
  if (track.embedCode?.startsWith("https://w.soundcloud.com/player/")) {
    let url = track.embedCode;
    url = url.replace(/auto_play=(true|false)/, "auto_play=false");
    if (!url.includes("auto_play=")) url += "&auto_play=false";
    url = url.replace(/&visual=true/, "").replace(/visual=true&/, "");
    return url;
  }
  return null;
}

function getYTEmbedUrl(track: Track, autoplay: boolean): string | null {
  if (track.mediaType !== "youtube") return null;
  const vid = getYouTubeId(track.embedCode ?? track.mediaUrl);
  if (!vid) return null;
  return `https://www.youtube.com/embed/${vid}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1`;
}

// Load an external script once
function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // don't block on error
    document.head.appendChild(s);
  });
}

export default function RadioPlayer() {
  const { theme, toggle: toggleTheme } = useTheme();

  const { data: rawTracks = [], isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tracks");
      return res.json();
    },
  });

  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [apisReady, setApisReady] = useState(false);

  const playlistRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(0);

  // SC widget instance (persists across track changes via load())
  const scWidgetRef = useRef<any>(null);
  const scIframeRef = useRef<HTMLIFrameElement>(null);

  // YT player instance
  const ytPlayerRef = useRef<any>(null);
  const ytIframeRef = useRef<HTMLIFrameElement>(null);

  // Which player is "active" for the current track
  const [activePlayer, setActivePlayer] = useState<"sc" | "yt" | "ht" | "none">("none");
  const activePlayerRef = useRef<"sc" | "yt" | "ht" | "none">("none");

  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { activePlayerRef.current = activePlayer; }, [activePlayer]);

  // ── Load SC + YT APIs once on mount ──────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await loadScript("https://w.soundcloud.com/player/api.js");
      // YT API uses a callback
      await new Promise<void>((resolve) => {
        if (window.YT?.Player) { resolve(); return; }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
        loadScript("https://www.youtube.com/iframe_api");
      });
      setApisReady(true);
    };
    init();
  }, []);

  // ── Init SC widget once iframe is in DOM ──────────────────────────────────
  useEffect(() => {
    if (!apisReady || !scIframeRef.current || scWidgetRef.current) return;
    const widget = window.SC.Widget(scIframeRef.current);
    scWidgetRef.current = widget;
    widget.bind(window.SC.Widget.Events.FINISH, () => {
      const next = (currentIndexRef.current + 1) % playlistRef.current.length;
      navigateTo(next, true);
    });
  }, [apisReady]);

  // ── Init YT player once iframe is in DOM ─────────────────────────────────
  const initYTPlayer = useCallback((autoplay: boolean, videoId: string) => {
    if (!apisReady || !window.YT?.Player) return;
    if (ytPlayerRef.current) {
      ytPlayerRef.current.destroy();
      ytPlayerRef.current = null;
    }
    ytPlayerRef.current = new window.YT.Player(ytIframeRef.current!, {
      videoId,
      playerVars: { autoplay: autoplay ? 1 : 0, rel: 0, modestbranding: 1 },
      events: {
        onStateChange: (e: any) => {
          if (e.data === 0) { // ended
            const next = (currentIndexRef.current + 1) % playlistRef.current.length;
            navigateTo(next, true);
          }
        },
      },
    });
  }, [apisReady]);

  // ── Core navigation ───────────────────────────────────────────────────────
  const navigateTo = useCallback((index: number, autoplay = false) => {
    const pl = playlistRef.current;
    if (!pl.length) return;
    const track = pl[index];

    currentIndexRef.current = index;
    setCurrentIndex(index);

    if (track.mediaType === "soundcloud") {
      const scUrl = getSCEmbedUrl(track);
      if (scUrl) {
        setActivePlayer("sc");
        activePlayerRef.current = "sc";
        if (scWidgetRef.current) {
          // SC Widget load() + optional play — works within gesture context
          const trackApiUrl = (() => {
            const m = scUrl.match(/url=([^&]+)/);
            return m ? decodeURIComponent(m[1]) : null;
          })();
          if (trackApiUrl) {
            scWidgetRef.current.load(trackApiUrl, {
              auto_play: autoplay,
              hide_related: false,
              show_comments: false,
              show_user: true,
              show_reposts: false,
              visual: false,
              callback: autoplay ? () => scWidgetRef.current?.play() : undefined,
            });
          }
        }
      } else {
        // Short redirect URL — no embed, open-only
        setActivePlayer("none");
      }
    } else if (track.mediaType === "youtube") {
      setActivePlayer("yt");
      activePlayerRef.current = "yt";
      const vid = getYouTubeId(track.embedCode ?? track.mediaUrl);
      if (vid && apisReady) {
        initYTPlayer(autoplay, vid);
      }
    } else if (track.mediaType === "hearthis") {
      setActivePlayer("ht");
      activePlayerRef.current = "ht";
    } else {
      setActivePlayer("none");
    }
  }, [apisReady, initYTPlayer]);

  // ── When playlist loads, show first track ────────────────────────────────
  useEffect(() => {
    if (rawTracks.length > 0) {
      const shuffled = shuffle(rawTracks);
      setPlaylist(shuffled);
      playlistRef.current = shuffled;
      setCurrentIndex(0);
      currentIndexRef.current = 0;
    }
  }, [rawTracks]);

  // ── Navigate to first track once APIs + playlist are both ready ──────────
  const initializedRef = useRef(false);
  useEffect(() => {
    if (apisReady && playlist.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      navigateTo(0, false);
    }
  }, [apisReady, playlist, navigateTo]);

  const currentTrack = playlist[currentIndex] ?? null;

  const skipNext = useCallback(() => {
    const next = (currentIndexRef.current + 1) % playlistRef.current.length;
    navigateTo(next, true);
  }, [navigateTo]);

  const skipPrev = useCallback(() => {
    const prev = (currentIndexRef.current - 1 + playlistRef.current.length) % playlistRef.current.length;
    navigateTo(prev, true);
  }, [navigateTo]);

  useEffect(() => {
    apiRequest("GET", "/api/tracks/status")
      .then((r) => r.json())
      .then((d) => setLastRefresh(d.fetchedAt))
      .catch(() => {});
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // HearThis embed src (static, no autoplay param needed — HT has its own controls)
  const htEmbedSrc = currentTrack?.mediaType === "hearthis" && currentTrack.embedCode
    ? currentTrack.embedCode : null;

  // SC iframe needs a stable initial src — the widget.load() call updates it
  const scInitialSrc = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1&auto_play=false";

  if (isLoading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>Loading playlist…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--color-bg)" }}>

      {/* ── Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)", gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg aria-label="LoopyPro Radio" viewBox="0 0 32 32" width="28" height="28" fill="none">
            <circle cx="16" cy="16" r="14" stroke="var(--color-accent)" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="7" stroke="var(--color-accent)" strokeWidth="1" strokeOpacity="0.5"/>
            <circle cx="16" cy="16" r="2.5" fill="var(--color-accent)"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", letterSpacing: "0.06em", color: "var(--color-text)" }}>
              LOOPYPRO RADIO
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Community Creations
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {lastRefresh && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>
              Updated {formatDate(lastRefresh)}
            </span>
          )}
          <button onClick={toggleTheme} aria-label="Toggle theme" style={{
            padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--color-border)",
            background: "transparent", color: "var(--color-text-muted)", cursor: "pointer", lineHeight: 1
          }}>
            {theme === "dark" ? "☀" : "☽"}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} className="radio-layout">

        {/* ── Now Playing panel ── */}
        <div style={{
          padding: "28px 28px 20px", borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)", display: "flex", flexDirection: "column", gap: "4px"
        }} className="now-playing-panel">

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "14px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-accent)",
                  display: "inline-block", boxShadow: "0 0 0 3px var(--color-accent-dim)"
                }} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-accent)", fontWeight: 600, letterSpacing: "0.1em" }}>ON AIR</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>{currentIndex + 1} / {playlist.length}</span>
              </div>
              <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text)", lineHeight: 1.25, marginBottom: "4px" }}>
                {currentTrack?.songTitle ?? "—"}
              </h1>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginBottom: "2px" }}>{currentTrack?.artistName ?? ""}</p>
              {currentTrack?.artistName !== currentTrack?.forumMember && currentTrack?.forumMember && (
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>posted by {currentTrack.forumMember}</p>
              )}
              {currentTrack?.threadUrl && (
                <a href={currentTrack.threadUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "8px",
                  fontSize: "var(--text-xs)", color: "var(--color-accent)", textDecoration: "none"
                }}>Forum thread ↗</a>
              )}
            </div>

            {/* Prev / Next */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, paddingTop: "4px" }}>
              <button onClick={skipPrev} aria-label="Previous track" style={{
                width: "38px", height: "38px", borderRadius: "50%", border: "1px solid var(--color-border)",
                background: "var(--color-surface-offset)", color: "var(--color-text-muted)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px"
              }}>&#9664;</button>
              <button onClick={skipNext} aria-label="Next track" style={{
                width: "38px", height: "38px", borderRadius: "50%", border: "1px solid var(--color-border)",
                background: "var(--color-surface-offset)", color: "var(--color-text-muted)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px"
              }}>&#9654;</button>
            </div>
          </div>

          {/* Player area */}
          {currentTrack && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href={getDirectUrl(currentTrack)} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: "14px", borderRadius: "10px", background: "var(--color-accent)",
                color: "#000", fontWeight: 700, fontSize: "var(--text-sm)", textDecoration: "none", letterSpacing: "0.02em"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Open on {mediaTypeLabel(currentTrack.mediaType)} ↗
              </a>

              {/* ── SC player (always mounted, hidden when not SC track) ── */}
              <div style={{
                borderRadius: "10px", overflow: "hidden",
                border: "1px solid var(--color-border)", background: "#000",
                display: activePlayer === "sc" ? "block" : "none"
              }}>
                <iframe
                  ref={scIframeRef}
                  id="sc-widget-iframe"
                  src={scInitialSrc}
                  width="100%" height="140"
                  style={{ display: "block", border: "none" }}
                  allow="autoplay; clipboard-write; encrypted-media"
                  title="SoundCloud player"
                />
              </div>

              {/* ── YT player (always mounted, hidden when not YT track) ── */}
              <div style={{
                borderRadius: "10px", overflow: "hidden",
                border: "1px solid var(--color-border)", background: "#000",
                display: activePlayer === "yt" ? "block" : "none"
              }}>
                <div ref={ytIframeRef} id="yt-player" style={{ width: "100%", height: "220px" }} />
              </div>

              {/* ── HearThis (remounted per track) ── */}
              {activePlayer === "ht" && htEmbedSrc && (
                <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--color-border)", background: "#000" }}>
                  <iframe
                    key={currentTrack.id}
                    src={htEmbedSrc}
                    width="100%" height="140"
                    style={{ display: "block", border: "none" }}
                    allow="autoplay; clipboard-write; encrypted-media"
                    title={currentTrack.songTitle}
                  />
                </div>
              )}

              {/* ── No embed available ── */}
              {activePlayer === "none" && (
                <div style={{
                  padding: "16px", borderRadius: "10px", border: "1px solid var(--color-border)",
                  background: "var(--color-surface-offset)", textAlign: "center",
                  fontSize: "var(--text-xs)", color: "var(--color-text-muted)"
                }}>
                  Click "Open on {mediaTypeLabel(currentTrack.mediaType)}" above to play this track
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", marginTop: "4px" }}>
            via {mediaTypeLabel(currentTrack?.mediaType ?? "")}
          </p>
        </div>

        {/* ── Playlist ── */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{
            padding: "12px 24px 10px", borderBottom: "1px solid var(--color-divider)",
            position: "sticky", top: 0, zIndex: 10, background: "var(--color-bg)"
          }}>
            <h2 style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>
              PLAYLIST — {playlist.length} TRACKS
            </h2>
          </div>

          <ul role="list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {playlist.map((track, idx) => {
              const isActive = idx === currentIndex;
              return (
                <li key={track.id} style={{ borderBottom: "1px solid var(--color-divider)" }}>
                  <button
                    onClick={() => navigateTo(idx, true)}
                    aria-current={isActive ? "true" : undefined}
                    style={{
                      width: "100%", textAlign: "left", padding: "12px 24px",
                      display: "flex", alignItems: "center", gap: "14px",
                      background: isActive ? "var(--color-surface-offset)" : "transparent",
                      borderLeft: isActive ? "3px solid var(--color-accent)" : "3px solid transparent",
                      cursor: "pointer", transition: "background 0.15s", border: "none"
                    }}
                  >
                    <div style={{
                      width: "24px", flexShrink: 0, textAlign: "right",
                      fontSize: "var(--text-xs)", color: isActive ? "var(--color-accent)" : "var(--color-text-faint)",
                      fontFamily: "var(--font-mono)", fontWeight: isActive ? 700 : 400
                    }}>
                      {isActive ? "●" : String(idx + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "var(--text-sm)", fontWeight: isActive ? 600 : 400, color: "var(--color-text)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>{track.songTitle}</div>
                      <div style={{
                        fontSize: "var(--text-xs)", color: "var(--color-text-muted)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {track.artistName}
                        {track.artistName !== track.forumMember && track.forumMember ? ` · ${track.forumMember}` : ""}
                      </div>
                    </div>
                    <span style={{
                      flexShrink: 0, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em",
                      padding: "2px 6px", borderRadius: "4px", color: "#fff",
                      background: track.mediaType === "soundcloud" ? "#f50" :
                                  track.mediaType === "youtube" ? "#f00" :
                                  track.mediaType === "hearthis" ? "#0aa" : "#666"
                    }}>
                      {track.mediaType === "soundcloud" ? "SC" :
                       track.mediaType === "youtube" ? "YT" :
                       track.mediaType === "hearthis" ? "HT" : "??"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div style={{ padding: "20px 24px", borderTop: "1px solid var(--color-divider)", textAlign: "center" }}>
            <a href="https://forum.loopypro.com/categories/creations" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", textDecoration: "none" }}>
              Music from the LoopyPro forum ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
