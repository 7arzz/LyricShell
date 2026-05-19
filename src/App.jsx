import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "./components/Hero";
import SearchSection from "./components/SearchSection";
import UploadSection from "./components/UploadSection";
import PreviewSection from "./components/PreviewSection";
import GenerateButton from "./components/GenerateButton";
import DownloadSection from "./components/DownloadSection";
import TerminalPreview from "./components/TerminalPreview";
import MatrixRain from "./components/MatrixRain";

export default function App() {
  const [songInfo, setSongInfo] = useState(null); // { id, title, artist, previewUrl, albumCover }
  const [lrcFile, setLrcFile] = useState(null);
  const [lrcContent, setLrcContent] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const handleLrcUpload = (file) => {
    setLrcFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLrcContent(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleLrcClear = () => {
    setLrcFile(null);
    setLrcContent("");
  };

  const handleGenerate = async () => {
    if (!songInfo) return;
    setGenerating(true);
    setShowTerminal(false);
    setDownloadUrl("");

    // Prepare payload. Using multipart form-data to send optional LRC file easily.
    const formData = new FormData();
    formData.append("title", songInfo.title);
    formData.append("artist", songInfo.artist);
    formData.append("previewUrl", songInfo.previewUrl);
    if (lrcFile) {
      formData.append("lrcFile", lrcFile);
    }

    try {
      const resp = await fetch("/generate", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        throw new Error("Generation failed");
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setFileName(`lyricshell_${songInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.py`);
      setShowTerminal(true);
    } catch (e) {
      console.error(e);
      alert("Failed to generate Python LyricShell player. Please make sure the backend is running.");
    } finally {
      setGenerating(false);
    }
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
            STATUS: SYSTEM_ACTIVE // PORT: 4000
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

        {/* Section 2: Song Preview & LRC Upload */}
        <AnimatePresence>
          {songInfo && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start scroll-mt-20"
            >
              <PreviewSection songInfo={songInfo} />
              <UploadSection 
                onLrcUpload={handleLrcUpload} 
                onLrcClear={handleLrcClear}
                lrcFile={lrcFile} 
                lrcContent={lrcContent} 
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Section 3: Generate Button */}
        <AnimatePresence>
          {songInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center justify-center py-6 scroll-mt-20"
            >
              <GenerateButton 
                disabled={generating} 
                generating={generating}
                onClick={handleGenerate} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 4: Result & Live Simulated Terminal */}
        <AnimatePresence>
          {(showTerminal || downloadUrl) && (
            <motion.section 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start scroll-mt-20"
            >
              <div className="md:col-span-3">
                <TerminalPreview songInfo={songInfo} lrcContent={lrcContent} />
              </div>
              <div className="md:col-span-2">
                <DownloadSection url={downloadUrl} fileName={fileName} />
              </div>
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
            pygame • rich • colorama • base64 • express • react
          </div>
        </div>
      </footer>
    </div>
  );
}
