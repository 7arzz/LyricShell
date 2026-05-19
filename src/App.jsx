import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "./components/Hero";
import SearchSection from "./components/SearchSection";
import UploadSection from "./components/UploadSection";
import TerminalPlayer from "./components/TerminalPlayer";
import MatrixRain from "./components/MatrixRain";
import CompilerSection from "./components/CompilerSection";

export default function App() {
  const [songInfo, setSongInfo] = useState(null); // { id, title, artist, previewUrl, albumCover }
  const [lrcFile, setLrcFile] = useState(null);
  const [lrcContent, setLrcContent] = useState("");
  const [lyricsLoading, setLyricsLoading] = useState(false);

  useEffect(() => {
    if (!songInfo) {
      setLrcFile(null);
      setLrcContent("");
      return;
    }

    const fetchLyrics = async () => {
      setLyricsLoading(true);
      setLrcFile(null);
      setLrcContent("");
      try {
        const resp = await fetch(`/_/backend/api/lyrics?title=${encodeURIComponent(songInfo.title)}&artist=${encodeURIComponent(songInfo.artist)}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.syncedLyrics) {
            setLrcContent(data.syncedLyrics);
            setLrcFile({ name: "auto_synced_lyrics.lrc", size: data.syncedLyrics.length });
          } else if (data.plainLyrics) {
            setLrcContent(data.plainLyrics);
            setLrcFile({ name: "auto_plain_lyrics.lrc", size: data.plainLyrics.length });
          }
        }
      } catch (err) {
        console.error("Error auto-fetching lyrics:", err);
      } finally {
        setLyricsLoading(false);
      }
    };

    fetchLyrics();
  }, [songInfo]);

  const handleLrcUpload = (file) => {
    setLrcFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLrcContent(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleLrcContentChange = (content) => {
    setLrcContent(content);
    if (!lrcFile) {
      setLrcFile({ name: "edited_signal.lrc", size: content.length });
    } else if (!(lrcFile instanceof File)) {
      setLrcFile({ ...lrcFile, size: content.length });
    }
  };

  const handleLrcClear = () => {
    setLrcFile(null);
    setLrcContent("");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative crt overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background VFX */}
      <MatrixRain />
      
      {/* Ambient glowing blobs in the background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 80, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-purple-500/5 blur-[120px]"
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Cyberpunk Neon Header */}
      <header className="border-b border-cyan-500/20 backdrop-blur-md sticky top-0 z-50 bg-[#030712]/70">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-500 glow-cyan animate-pulse"></span>
            <span className="font-orbitron text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              LYRICSHELL // OS_v1.0.8
            </span>
          </div>
          <div className="font-terminal text-xs text-cyan-400/70 tracking-widest hidden sm:block">
            STATUS: SYSTEM_ACTIVE // CLIENT_MODE
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 space-y-16 relative z-10">
        
        {/* Section 1: Music Search */}
        <section id="search" className="scroll-mt-20">
          <SearchSection onSelect={setSongInfo} selectedSong={songInfo} />
        </section>

        {/* Section 2: Interactive Terminal Music Player & LRC Upload */}
        <AnimatePresence>
          {songInfo && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start scroll-mt-20"
            >
              {/* Left Column: Interactive Terminal Player */}
              <TerminalPlayer songInfo={songInfo} lrcContent={lrcContent} />
              
              {/* Right Column: Lyric Editor & Settings */}
              <UploadSection 
                onLrcUpload={handleLrcUpload} 
                onLrcClear={handleLrcClear}
                onLrcContentChange={handleLrcContentChange}
                lrcFile={lrcFile} 
                lrcContent={lrcContent}
                lyricsLoading={lyricsLoading}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section 3: Standing Compiler */}
        <AnimatePresence>
          {songInfo && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="scroll-mt-20"
            >
              <CompilerSection songInfo={songInfo} lrcContent={lrcContent} />
            </motion.section>
          )}
        </AnimatePresence>

      </main>

      <footer className="border-t border-purple-500/10 py-8 bg-[#0a0f1e]/40 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-terminal text-sm text-slate-500">
            [ LYRICSHELL PROJ ] INITIALIZED BY GOOGLE DEEPMIND TEAM
          </div>
          <div className="font-terminal text-xs text-purple-400/50">
            react • tailwindcss • framer-motion • html5 audio • express
          </div>
        </div>
      </footer>
    </div>
  );
}
