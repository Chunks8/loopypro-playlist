import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Track } from "@shared/schema";

declare global {
  interface Window { SC: any; YT: any; onYouTubeIframeAPIReady: () => void; }
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
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  return { theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") };
}

function mediaTypeLabel(t: string) {
  return t === "soundcloud" ? "SoundCloud" : t === "youtube" ? "YouTube" : t === "hearthis" ? "HearThis" : t;
}

function getDirectUrl(track: Track): string {
  if (track.mediaType === "youtube") {
    const vid = getYouTubeId(track.embedCode ?? track.mediaUrl);
    return vid ? `https://www.youtube.com/watch?v=${vid}` : track.mediaUrl;
  }
  return track.mediaUrl;
}

function getSCTrackUrl(track: Track): string | null {
  if (track.mediaType !== "soundcloud") return null;
  if (track.embedCode?.startsWith("https://w.soundcloud.com/player/")) {
    const m = track.embedCode.match(/url=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  return null;
}

export default function RadioPlayer() {
  const { theme, toggle: toggleTheme } = useTheme();

  const { data: rawTracks = [], isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
    queryFn: async () => (await apiRequest("GET", "/api/tracks")).json(),
  });

  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePlayer, setActivePlayer] = useState<"sc" | "yt" | "ht" | "none">("none");
  const [htSrc, setHtSrc] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  // Stable refs so callbacks always see latest values
  const playlistRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(0);
  const activePlayerRef = useRef<"sc" | "yt" | "ht" | "none">("none");

  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { activePlayerRef.current = activePlayer; }, [activePlayer]);

  // SC widget ref — the widget instance (persists, we just call load() on it)
  const scWidgetRef = useRef<any>(null);
  const scIframeRef = useRef<HTMLIFrameElement>(null);
  const scReadyRef = useRef(false);

  // YT player ref
  const ytPlayerRef = useRef<any>(null);
  const ytDivRef = useRef<HTMLDivElement>(null);
  const ytReadyRef = useRef(false);

  // Pending action after widget becomes ready
  const pendingSCRef = useRef<{ url: string; autoplay: boolean } | null>(null);
  const pendingYTRef = useRef<{ vid: string; autoplay: boolean } | null>(null);

  // ── Load external APIs ────────────────────────────────────────────────────
  useEffect(() => {
    // SC Widget API
    if (!document.querySelector('script[src*="soundcloud.com/player/api"]')) {
      const s = document.createElement("script");
      s.src = "https://w.soundcloud.com/player/api.js";
      document.head.appendChild(s);
    }
    // YT IFrame API
    if (!window.YT) {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        ytReadyRef.current = true;
        // If there's a pending YT track, load it now
        if (pendingYTRef.current) {
          const { vid, autoplay } = pendingYTRef.current;
          pendingYTRef.current = null;
          createYTPlayer(vid, autoplay);
        }
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    } else {
      ytReadyRef.current = true;
    }
  }, []);

  // ── SC widget setup — runs once the iframe is in the DOM ─────────────────
  useEffect(() => {
    if (!scIframeRef.current) return;
    // Poll until SC is available (script may still be loading)
    const poll = setInterval(() => {
      if (!window.SC || scWidgetRef.current) { clearInterval(poll); return; }
      clearInterval(poll);
      const widget = window.SC.Widget(scIframeRef.current);
      scWidgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        scReadyRef.current = true;
        if (pendingSCRef.current) {
          const { url, autoplay } = pendingSCRef.current;
          pendingSCRef.current = null;
          scWidgetRef.current.load(url, { auto_play: autoplay, visual: false, show_comments: false });
        }
      });

      widget.bind(window.SC.Widget.Events.FINISH, () => {
        const next = (currentIndexRef.current + 1) % playlistRef.current.length;
        navigateTo(next, true);
      });
    }, 200);

    return () => clearInterval(poll);
  }, []);

  // ── YT player factory ────────────────────────────────────────────────────
  const createYTPlayer = useCallback((vid: string, autoplay: boolean) => {
    if (ytPlayerRef.current) {
      try { ytPlayerRef.current.destroy(); } catch {}
      ytPlayerRef.current = null;
    }
    if (!ytDivRef.current) return;

    // Re-create the target div (YT replaces it with an iframe)
    const container = ytDivRef.current.parentElement!;
    const newDiv = document.createElement("div");
    newDiv.id = "yt-target";
    newDiv.style.width = "100%";
    newDiv.style.height = "220px";
    ytDivRef.current.replaceWith(newDiv);
    (ytDivRef as any).current = newDiv;

    ytPlayerRef.current = new window.YT.Player(newDiv, {
      videoId: vid,
      width: "100%",
      height: "220",
      playerVars: { autoplay: autoplay ? 1 : 0, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => { ytReadyRef.current = true; },
        onStateChange: (e: any) => {
          if (e.data === 0) { // ENDED
            const next = (currentIndexRef.current + 1) % playlistRef.current.length;
            navigateTo(next, true);
          }
        },
      },
    });
  }, []);

  // ── Core navigation ───────────────────────────────────────────────────────
  const navigateTo = useCallback((index: number, autoplay = false) => {
    const pl = playlistRef.current;
    if (!pl.length) return;
    const track = pl[index];
    currentIndexRef.current = index;
    setCurrentIndex(index);

    // Stop whatever is currently playing
    if (activePlayerRef.current === "sc" && scWidgetRef.current) {
      try { scWidgetRef.current.pause(); } catch {}
    }
    if (activePlayerRef.current === "yt" && ytPlayerRef.current) {
      try { ytPlayerRef.current.pauseVideo(); } catch {}
    }

    if (track.mediaType === "soundcloud") {
      const scUrl = getSCTrackUrl(track);
      if (scUrl) {
        setActivePlayer("sc");
        activePlayerRef.current = "sc";
        if (scReadyRef.current && scWidgetRef.current) {
          scWidgetRef.current.load(scUrl, {
            auto_play: autoplay,
            visual: false,
            show_comments: false,
          });
        } else {
          pendingSCRef.current = { url: scUrl, autoplay };
        }
      } else {
        // Short redirect URL — no embed
        setActivePlayer("none");
        activePlayerRef.current = "none";
      }
    } else if (track.mediaType === "youtube") {
      const vid = getYouTubeId(track.embedCode ?? track.mediaUrl);
      if (vid) {
        setActivePlayer("yt");
        activePlayerRef.current = "yt";
        if (ytReadyRef.current && window.YT?.Player) {
          createYTPlayer(vid, autoplay);
        } else {
          pendingYTRef.current = { vid, autoplay };
        }
      } else {
        setActivePlayer("none");
        activePlayerRef.current = "none";
      }
    } else if (track.mediaType === "hearthis" && track.embedCode) {
      setActivePlayer("ht");
      activePlayerRef.current = "ht";
      setHtSrc(track.embedCode);
    } else {
      setActivePlayer("none");
      activePlayerRef.current = "none";
    }
  }, [createYTPlayer]);

  // ── Initialize playlist ───────────────────────────────────────────────────
  const initializedRef = useRef(false);
  useEffect(() => {
    if (rawTracks.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      const shuffled = shuffle(rawTracks);
      setPlaylist(shuffled);
      playlistRef.current = shuffled;
      // Navigate to first track once SC widget is ready (no autoplay on first load)
      const tryInit = setInterval(() => {
        if (scReadyRef.current) {
          clearInterval(tryInit);
          navigateTo(0, false);
        }
      }, 200);
    }
  }, [rawTracks, navigateTo]);

  const currentTrack = playlist[currentIndex] ?? null;

  const skipNext = useCallback(() => {
    navigateTo((currentIndexRef.current + 1) % playlistRef.current.length, true);
  }, [navigateTo]);

  const skipPrev = useCallback(() => {
    navigateTo((currentIndexRef.current - 1 + playlistRef.current.length) % playlistRef.current.length, true);
  }, [navigateTo]);

  useEffect(() => {
    apiRequest("GET", "/api/tracks/status")
      .then(r => r.json()).then(d => setLastRefresh(d.fetchedAt)).catch(() => {});
  }, []);

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  if (isLoading) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
      <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>Loading playlist…</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--color-bg)" }}>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)", gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <circle cx="16" cy="16" r="14" stroke="var(--color-accent)" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="7" stroke="var(--color-accent)" strokeWidth="1" strokeOpacity="0.5"/>
            <circle cx="16" cy="16" r="2.5" fill="var(--color-accent)"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", letterSpacing: "0.06em", color: "var(--color-text)" }}>LOOPYPRO RADIO</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Community Creations</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {lastRefresh && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>Updated {formatDate(lastRefresh)}</span>}
          <button onClick={toggleTheme} aria-label="Toggle theme" style={{
            padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--color-border)",
            background: "transparent", color: "var(--color-text-muted)", cursor: "pointer", lineHeight: 1
          }}>{theme === "dark" ? "☀" : "☽"}</button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} className="radio-layout">

        {/* Now Playing */}
        <div style={{
          padding: "28px 28px 20px", borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)", display: "flex", flexDirection: "column", gap: "4px"
        }} className="now-playing-panel">

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "14px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-accent)", display: "inline-block", boxShadow: "0 0 0 3px var(--color-accent-dim)" }} />
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
              {[["Previous track", "&#9664;", skipPrev], ["Next track", "&#9654;", skipNext]].map(([label, symbol, handler]) => (
                <button key={label as string} onClick={handler as any} aria-label={label as string} style={{
                  width: "38px", height: "38px", borderRadius: "50%", border: "1px solid var(--color-border)",
                  background: "var(--color-surface-offset)", color: "var(--color-text-muted)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px"
                }} dangerouslySetInnerHTML={{ __html: symbol as string }} />
              ))}
            </div>
          </div>

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

              {/* SC player — always mounted so widget persists */}
              <div style={{
                borderRadius: "10px", overflow: "hidden", border: "1px solid var(--color-border)", background: "#000",
                display: activePlayer === "sc" ? "block" : "none"
              }}>
                <iframe ref={scIframeRef} id="sc-widget-iframe"
                  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2303650415&auto_play=false&visual=false&show_comments=false"
                  width="100%" height="140" style={{ display: "block", border: "none" }}
                  allow="autoplay; clipboard-write; encrypted-media" title="SoundCloud player" />
              </div>

              {/* YT player — always mounted */}
              <div style={{
                borderRadius: "10px", overflow: "hidden", border: "1px solid var(--color-border)", background: "#000",
                display: activePlayer === "yt" ? "block" : "none"
              }}>
                <div ref={ytDivRef} id="yt-target" style={{ width: "100%", height: "220px" }} />
              </div>

              {/* HearThis — remounted per track */}
              {activePlayer === "ht" && htSrc && (
                <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--color-border)", background: "#000" }}>
                  <iframe key={currentTrack.id} src={htSrc} width="100%" height="140"
                    style={{ display: "block", border: "none" }}
                    allow="autoplay; clipboard-write; encrypted-media" title={currentTrack.songTitle} />
                </div>
              )}

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

        {/* Playlist */}
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
                  <button onClick={() => navigateTo(idx, true)} aria-current={isActive ? "true" : undefined} style={{
                    width: "100%", textAlign: "left", padding: "12px 24px",
                    display: "flex", alignItems: "center", gap: "14px",
                    background: isActive ? "var(--color-surface-offset)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--color-accent)" : "3px solid transparent",
                    cursor: "pointer", transition: "background 0.15s", border: "none"
                  }}>
                    <div style={{
                      width: "24px", flexShrink: 0, textAlign: "right",
                      fontSize: "var(--text-xs)", color: isActive ? "var(--color-accent)" : "var(--color-text-faint)",
                      fontFamily: "var(--font-mono)", fontWeight: isActive ? 700 : 400
                    }}>{isActive ? "●" : String(idx + 1).padStart(2, "0")}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "var(--text-sm)", fontWeight: isActive ? 600 : 400, color: "var(--color-text)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>{track.songTitle}</div>
                      <div style={{
                        fontSize: "var(--text-xs)", color: "var(--color-text-muted)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {track.artistName}{track.artistName !== track.forumMember && track.forumMember ? ` · ${track.forumMember}` : ""}
                      </div>
                    </div>
                    <span style={{
                      flexShrink: 0, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em",
                      padding: "2px 6px", borderRadius: "4px", color: "#fff",
                      background: track.mediaType === "soundcloud" ? "#f50" : track.mediaType === "youtube" ? "#f00" : track.mediaType === "hearthis" ? "#0aa" : "#666"
                    }}>
                      {track.mediaType === "soundcloud" ? "SC" : track.mediaType === "youtube" ? "YT" : track.mediaType === "hearthis" ? "HT" : "??"}
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
