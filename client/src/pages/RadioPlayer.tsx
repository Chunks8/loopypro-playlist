import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Track } from "@shared/schema";

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

function buildEmbedSrc(track: Track): string | null {
  if (track.mediaType === "soundcloud") {
    if (!track.embedCode?.startsWith("https://w.soundcloud.com/player/")) return null;
    let url = track.embedCode;
    url = url.replace(/auto_play=(true|false)/, "auto_play=false");
    if (!url.includes("auto_play=")) url += "&auto_play=false";
    url = url.replace(/&visual=true/, "").replace(/visual=true&/, "");
    return url;
  }
  if (track.mediaType === "youtube") {
    const vid = getYouTubeId(track.embedCode ?? track.mediaUrl);
    if (!vid) return null;
    // enablejsapi=1 allows YT to send ENDED state via postMessage
    return `https://www.youtube.com/embed/${vid}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`;
  }
  if (track.mediaType === "hearthis" && track.embedCode) {
    return track.embedCode;
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
  // embedKey forces iframe to fully unmount+remount on every track change
  // This is the only reliable way to stop audio on iOS — destroying the iframe
  const [embedKey, setEmbedKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const playlistRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(0);
  const nowPlayingRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // Auto-advance: listen for YouTube ENDED via postMessage
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "onStateChange" && data?.info === 0) {
          // YouTube ended — advance to next visible track
          const vis = getVisiblePlaylist();
          const cur = playlistRef.current[currentIndexRef.current];
          const visIdx = vis.indexOf(cur);
          const nextTrack = vis[(visIdx + 1) % vis.length];
          const nextIdx = playlistRef.current.indexOf(nextTrack);
          setCurrentIndex(nextIdx);
          currentIndexRef.current = nextIdx;
          setEmbedKey(k => k + 1);
        }
      } catch {}
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (rawTracks.length > 0) {
      // Tracks arrive sorted most-recent first (by id desc) from the API
      setPlaylist(rawTracks);
      playlistRef.current = rawTracks;
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      setEmbedKey(k => k + 1);
    }
  }, [rawTracks]);

  // Split playlist: one track per member in main list, extras in overflow buckets
  const { mainPlaylist, overflowByMember } = (() => {
    const seen = new Set<string>();
    const main: Track[] = [];
    const overflow: Record<string, Track[]> = {};
    for (const t of playlist) {
      const key = t.forumMember ?? t.artistName ?? "unknown";
      if (!seen.has(key)) { seen.add(key); main.push(t); }
      else { if (!overflow[key]) overflow[key] = []; overflow[key].push(t); }
    }
    return { mainPlaylist: main, overflowByMember: overflow };
  })();

  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  // Keep refs to everything skip callbacks need — updated synchronously during render
  const mainPlaylistRef = useRef<Track[]>(mainPlaylist);
  const overflowByMemberRef = useRef<Record<string, Track[]>>(overflowByMember);
  const expandedMembersRef = useRef<Set<string>>(expandedMembers);
  mainPlaylistRef.current = mainPlaylist;
  overflowByMemberRef.current = overflowByMember;
  expandedMembersRef.current = expandedMembers;

  const toggleExpanded = (member: string) => {
    setExpandedMembers(prev => {
      const next = new Set(prev);
      next.has(member) ? next.delete(member) : next.add(member);
      return next;
    });
  };

  // Compute visible playlist from current refs — safe to call inside callbacks
  const getVisiblePlaylist = useCallback(() => {
    const result: Track[] = [];
    for (const t of mainPlaylistRef.current) {
      result.push(t);
      const member = t.forumMember ?? t.artistName ?? "unknown";
      if (expandedMembersRef.current.has(member)) {
        result.push(...(overflowByMemberRef.current[member] ?? []));
      }
    }
    return result;
  }, []);

  // Render-time visible playlist (for display + counter)
  const visiblePlaylist = getVisiblePlaylist();

  const currentTrack = playlist[currentIndex] ?? null;
  const embedSrc = currentTrack ? buildEmbedSrc(currentTrack) : null;

  const navigateTo = useCallback((index: number) => {
    currentIndexRef.current = index;
    setCurrentIndex(index);
    setEmbedKey(k => k + 1);
    setFlash(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      nowPlayingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    setTimeout(() => setFlash(false), 600);
  }, []);

  // Skip reads visiblePlaylist fresh via getVisiblePlaylist() — never stale
  const skipNext = useCallback(() => {
    const vis = getVisiblePlaylist();
    const cur = playlistRef.current[currentIndexRef.current];
    const visIdx = vis.indexOf(cur);
    const nextTrack = vis[(visIdx + 1) % vis.length];
    navigateTo(playlistRef.current.indexOf(nextTrack));
  }, [navigateTo, getVisiblePlaylist]);

  const skipPrev = useCallback(() => {
    const vis = getVisiblePlaylist();
    const cur = playlistRef.current[currentIndexRef.current];
    const visIdx = vis.indexOf(cur);
    const prevTrack = vis[(visIdx - 1 + vis.length) % vis.length];
    navigateTo(playlistRef.current.indexOf(prevTrack));
  }, [navigateTo, getVisiblePlaylist]);

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
        <div ref={nowPlayingRef} style={{
          padding: "28px 28px 20px", borderBottom: "1px solid var(--color-border)",
          background: flash ? "var(--color-surface-offset)" : "var(--color-surface)",
          display: "flex", flexDirection: "column", gap: "4px",
          transition: "background 0.3s"
        }} className="now-playing-panel">

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "14px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-accent)",
                  display: "inline-block", boxShadow: "0 0 0 3px var(--color-accent-dim)"
                }} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-accent)", fontWeight: 600, letterSpacing: "0.1em" }}>ON AIR</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>{visiblePlaylist.indexOf(currentTrack!) + 1 || "–"} / {visiblePlaylist.length}</span>
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

          {currentTrack && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              {/* Open externally */}
              <a href={getDirectUrl(currentTrack)} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: "14px", borderRadius: "10px", background: "var(--color-accent)",
                color: "#000", fontWeight: 700, fontSize: "var(--text-sm)", textDecoration: "none"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Open on {mediaTypeLabel(currentTrack.mediaType)} ↗
              </a>

              {/* Embed — key forces full remount on every track change, stopping previous audio */}
              {embedSrc ? (
                <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--color-border)", background: "#000" }}>
                  <iframe
                    key={embedKey}
                    src={embedSrc}
                    width="100%"
                    height={currentTrack.mediaType === "youtube" ? "220" : "140"}
                    style={{ display: "block", border: "none" }}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={currentTrack.songTitle}
                  />
                </div>
              ) : (
                <div style={{
                  padding: "20px 16px", borderRadius: "10px", border: "1px solid var(--color-border)",
                  background: "var(--color-surface-offset)", textAlign: "center"
                }}>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
                    Tap "Open on {mediaTypeLabel(currentTrack.mediaType)}" above to play
                  </p>
                </div>
              )}

              {/* iOS tap-to-play hint */}
              {embedSrc && (
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", textAlign: "center", margin: 0 }}>
                  Tap the play button in the player above · Skip loads the next track
                </p>
              )}
            </div>
          )}
        </div>

        {/* Playlist */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: "auto" }}>
          <div style={{
            padding: "12px 24px 10px", borderBottom: "1px solid var(--color-divider)",
            position: "sticky", top: 0, zIndex: 10, background: "var(--color-bg)"
          }}>
            <h2 style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>
              PLAYLIST — {mainPlaylist.length} TRACKS
            </h2>
          </div>

          {/* Main playlist: one track per member */}
          <ul role="list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {mainPlaylist.map((track, displayIdx) => {
              const fullIdx = playlist.indexOf(track);
              const isActive = fullIdx === currentIndex;
              const member = track.forumMember ?? track.artistName ?? "unknown";
              const extras = overflowByMember[member] ?? [];
              const isExpanded = expandedMembers.has(member);
              return (
                <li key={track.id} style={{ borderBottom: extras.length > 0 && !isExpanded ? "none" : "1px solid var(--color-divider)" }}>
                  <button onClick={() => navigateTo(fullIdx)} aria-current={isActive ? "true" : undefined} style={{
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
                    }}>{isActive ? "●" : String(displayIdx + 1).padStart(2, "0")}</div>
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

                  {/* Expand toggle — shown only for members with extra tracks */}
                  {extras.length > 0 && (
                    <>
                      <button
                        onClick={() => toggleExpanded(member)}
                        style={{
                          width: "100%", textAlign: "left",
                          padding: "7px 24px 7px 62px",
                          display: "flex", alignItems: "center", gap: "6px",
                          background: "transparent", border: "none",
                          borderLeft: "3px solid transparent",
                          borderBottom: isExpanded ? "none" : "1px solid var(--color-divider)",
                          cursor: "pointer", color: "var(--color-accent)",
                          fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.04em"
                        }}
                      >
                        <span style={{ transition: "transform 0.2s", display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                        {isExpanded ? `Hide` : `+${extras.length} more from ${member}`}
                      </button>

                      {/* Extra tracks — same row style, indented slightly */}
                      {isExpanded && (
                        <ul role="list" style={{ listStyle: "none", padding: 0, margin: 0, borderBottom: "1px solid var(--color-divider)" }}>
                          {extras.map((xtrack) => {
                            const xFullIdx = playlist.indexOf(xtrack);
                            const xActive = xFullIdx === currentIndex;
                            return (
                              <li key={xtrack.id} style={{ borderBottom: "1px solid var(--color-divider)" }}>
                                <button onClick={() => navigateTo(xFullIdx)} aria-current={xActive ? "true" : undefined} style={{
                                  width: "100%", textAlign: "left", padding: "12px 24px 12px 62px",
                                  display: "flex", alignItems: "center", gap: "14px",
                                  background: xActive ? "var(--color-surface-offset)" : "var(--color-surface)",
                                  borderLeft: xActive ? "3px solid var(--color-accent)" : "3px solid transparent",
                                  cursor: "pointer", transition: "background 0.15s", border: "none"
                                }}>
                                  <div style={{
                                    width: "24px", flexShrink: 0, textAlign: "right",
                                    fontSize: "var(--text-xs)", color: xActive ? "var(--color-accent)" : "var(--color-text-faint)",
                                    fontFamily: "var(--font-mono)", fontWeight: xActive ? 700 : 400
                                  }}>{xActive ? "●" : "–"}</div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                      fontSize: "var(--text-sm)", fontWeight: xActive ? 600 : 400, color: "var(--color-text)",
                                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                    }}>{xtrack.songTitle}</div>
                                    <div style={{
                                      fontSize: "var(--text-xs)", color: "var(--color-text-muted)",
                                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                    }}>
                                      {xtrack.artistName}{xtrack.artistName !== xtrack.forumMember && xtrack.forumMember ? ` · ${xtrack.forumMember}` : ""}
                                    </div>
                                  </div>
                                  <span style={{
                                    flexShrink: 0, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em",
                                    padding: "2px 6px", borderRadius: "4px", color: "#fff",
                                    background: xtrack.mediaType === "soundcloud" ? "#f50" : xtrack.mediaType === "youtube" ? "#f00" : xtrack.mediaType === "hearthis" ? "#0aa" : "#666"
                                  }}>
                                    {xtrack.mediaType === "soundcloud" ? "SC" : xtrack.mediaType === "youtube" ? "YT" : xtrack.mediaType === "hearthis" ? "HT" : "??"}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  )}
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
