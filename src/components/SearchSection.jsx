import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SearchSection({ onSelect, selectedSong }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playingPreview, setPlayingPreview] = useState(null); // URL of currently playing audio element
  const [audioEl, setAudioEl] = useState(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Search Deezer
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const searchSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`http://localhost:4000/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (!resp.ok) {
          throw new Error("Search request failed");
        }
        const data = await resp.json();
        // Deezer returns data in results.data
        setResults(data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tracks. Is backend offline?");
      } finally {
        setLoading(false);
      }
    };

    searchSongs();
  }, [debouncedQuery]);

  // Handle preview play/pause
  const togglePlayPreview = (previewUrl) => {
    if (playingPreview === previewUrl) {
      // Pause
      if (audioEl) {
        audioEl.pause();
      }
      setPlayingPreview(null);
    } else {
      // Play new
      if (audioEl) {
        audioEl.pause();
      }
      const newAudio = new Audio(previewUrl);
      newAudio.volume = 0.5;
      newAudio.play().catch(e => console.error("Audio playback error:", e));
      newAudio.onended = () => {
        setPlayingPreview(null);
      };
      setAudioEl(newAudio);
      setPlayingPreview(previewUrl);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioEl) {
        audioEl.pause();
      }
    };
  }, [audioEl]);

  return (
    <div className="glass-card p-6 md:p-8 border border-cyan-500/20 relative overflow-hidden">
      {/* Visual cyber accent lines */}
      <div className="absolute top-0 left-0 w-24 h-[2px] bg-cyan-400"></div>
      <div className="absolute top-0 left-0 w-[2px] h-24 bg-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-24 h-[2px] bg-purple-500"></div>
      <div className="absolute bottom-0 right-0 w-[2px] h-24 bg-purple-500"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-orbitron font-bold tracking-widest text-cyan-400 flex items-center gap-2">
            <span className="text-purple-400">&gt;_</span> MUSIC SEARCH GRID
          </h2>
          <p className="text-slate-400 text-xs font-terminal mt-1">
            QUERY DEEZER SENSOR ARRAYS FOR AVAILABLE AUDIO SIGNALS
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            className="w-full bg-[#070b19] border border-cyan-500/30 rounded-lg px-4 py-2 pl-10 font-terminal text-sm text-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            placeholder="ENTER SONG, ARTIST..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-cyan-500/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-2.5 text-purple-400 hover:text-cyan-400 transition"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-12 h-12 border-4 border-t-cyan-400 border-cyan-500/10 rounded-full animate-spin"></div>
          <span className="font-terminal text-xs text-cyan-400 animate-pulse">CONNECTING TO MUSIC PREVIEW SUB-GRID...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="border border-red-500/30 bg-red-950/20 rounded-lg p-4 text-center my-6">
          <p className="font-terminal text-sm text-red-400">{error}</p>
          <button
            onClick={() => setQuery(query)}
            className="mt-2 text-xs font-terminal text-cyan-400 hover:underline"
          >
            RETRY DIRECT SIGNAL FETCH
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && debouncedQuery && (
        <div className="text-center py-12 border border-slate-500/10 rounded-lg bg-[#070b19]/40">
          <p className="font-terminal text-sm text-slate-400">NO AUDIO TRANSMISSIONS FOUND FOR "{debouncedQuery.toUpperCase()}"</p>
          <p className="text-xs text-slate-500 font-terminal mt-1">CHECK CONNECTION PARAMETERS OR DIAL ANOTHER FREQUENCY</p>
        </div>
      )}

      {/* Default/Waiting State */}
      {!loading && !error && results.length === 0 && !query && (
        <div className="text-center py-16 border border-cyan-500/10 rounded-lg bg-[#070b19]/20">
          <div className="mb-4 inline-flex p-3 rounded-full bg-cyan-500/5 text-cyan-400 animate-pulse">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <p className="font-terminal text-sm text-cyan-400/80">READY TO SCAN DEEZER API</p>
          <p className="text-xs text-slate-500 font-terminal mt-1">INPUT SEARCH PARAMETERS IN CONTROL TERMINAL ABOVE</p>
        </div>
      )}

      {/* Results grid */}
      {!loading && !error && results.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {results.map((song) => {
            const isSelected = selectedSong?.id === song.id;
            const isPlaying = playingPreview === song.preview;

            return (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                key={song.id}
                className={`relative group bg-[#070b19]/60 border rounded-xl overflow-hidden transition-colors duration-300 ${
                  isSelected
                    ? "border-cyan-400 glow-cyan bg-[#0c142c]/90"
                    : "border-slate-500/20 hover:border-cyan-500/40"
                }`}
                whileHover={!isSelected ? { scale: 1.02 } : {}}
              >
                {/* Album Cover & Hover Play Overlay */}
                <div className="relative aspect-square w-full bg-[#050811] overflow-hidden">
                  <img
                    src={song.album.cover_medium}
                    alt={song.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Neon scanline accent inside card */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b19] via-transparent to-transparent opacity-80 pointer-events-none"></div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs">
                    <button
                      onClick={() => togglePlayPreview(song.preview)}
                      className={`p-4 rounded-full transition-transform hover:scale-110 duration-200 ${
                        isPlaying ? "bg-purple-600 text-white shadow-[0_0_15px_#bd00ff]" : "bg-cyan-500 text-black shadow-[0_0_15px_#00f5ff]"
                      }`}
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Playing Signal Bar indicator */}
                  {isPlaying && (
                    <div className="absolute bottom-3 left-3 flex gap-1 items-end h-6 bg-black/75 px-3 py-1.5 rounded-full border border-purple-500/30">
                      <div className="eq-bar h-4"></div>
                      <div className="eq-bar h-4"></div>
                      <div className="eq-bar h-4"></div>
                      <span className="font-terminal text-[10px] text-purple-400 ml-1">AUDIO PLAYING</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-orbitron font-bold text-sm text-slate-100 truncate tracking-wide" title={song.title}>
                      {song.title}
                    </h3>
                    <p className="font-terminal text-xs text-purple-400 truncate mt-0.5">
                      {song.artist.name}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => togglePlayPreview(song.preview)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md border text-xs font-terminal transition ${
                        isPlaying
                          ? "bg-purple-950/40 text-purple-400 border-purple-500/40"
                          : "bg-cyan-950/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-950/40 hover:border-cyan-400"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                          PAUSE PREVIEW
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          LISTEN SIGNAL
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onSelect({
                          id: song.id,
                          title: song.title,
                          artist: song.artist.name,
                          previewUrl: song.preview,
                          albumCover: song.album.cover_medium,
                        });
                        // Scroll down to preview section
                        setTimeout(() => {
                          const el = document.getElementById("search");
                          if (el) {
                            window.scrollTo({
                              top: el.offsetTop + el.clientHeight + 40,
                              behavior: "smooth"
                            });
                          }
                        }, 100);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-md text-xs font-orbitron font-bold transition flex items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-cyan-500 text-black shadow-[0_0_12px_#00f5ff] hover:bg-cyan-400"
                          : "bg-purple-600/30 text-purple-300 border border-purple-500/40 hover:bg-purple-600/60 hover:text-white"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                          SELECTED
                        </>
                      ) : (
                        "SELECT TRACK"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
