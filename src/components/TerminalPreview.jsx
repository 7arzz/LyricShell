import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TerminalPreview({ songInfo, lrcContent }) {
  const [lines, setLines] = useState([]);
  const [booting, setBooting] = useState(true);
  const containerRef = useRef(null);

  // Parse a few lyrics to simulate playback
  const extractLyrics = () => {
    if (!lrcContent) return ["  ♪  [LYRICS OFFLINE] No LRC file was uploaded"];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    const parsed = [];
    for (let line of lrcContent.split("\n")) {
      const match = timeRegex.exec(line);
      if (match) {
        const text = line.replace(timeRegex, "").trim();
        if (text) parsed.push(text);
      }
    }
    return parsed.length > 0 ? parsed.slice(0, 7) : ["  ♪  [LYRICS OFFLINE]"];
  };

  useEffect(() => {
    let timeoutIds = [];
    let isMounted = true;

    // Generate random hex dumps for fake memory loading
    const makeHex = () => Array.from({length: 4}, () => Math.floor(Math.random()*65535).toString(16).padStart(4, '0').toUpperCase()).join(' ');

    const bootSequence = [
      { text: "> INITIALIZING LYRICSHELL KERNEL...", color: "text-slate-400", delay: 300 },
      { text: "[ OK ] CORE SYSTEMS ONLINE", color: "text-green-500", delay: 700 },
      { text: `[ INFO ] ALLOCATING MEMORY BLOCKS: ${makeHex()}`, color: "text-cyan-500/50", delay: 1000 },
      { text: `[ INFO ] ALLOCATING MEMORY BLOCKS: ${makeHex()}`, color: "text-cyan-500/50", delay: 1100 },
      { text: `[ INFO ] ALLOCATING MEMORY BLOCKS: ${makeHex()}`, color: "text-cyan-500/50", delay: 1200 },
      { text: "[ OK ] AUDIO DECODER INTERFACE MOUNTED", color: "text-cyan-400", delay: 1600 },
      { text: "[ OK ] LYRIC CORRELATION ENGINE ACTIVE", color: "text-purple-400", delay: 2000 },
      { text: "[ WARN ] DECOMPRESSING EMBEDDED BUFFER (MAY TAKE A MOMENT)", color: "text-yellow-500", delay: 2500 },
      { text: "[ OK ] BOOT SEQUENCE COMPLETE.", color: "text-green-400 font-bold", delay: 3200 },
      { clear: true, delay: 3800 },
      { text: "━".repeat(30), color: "text-cyan-500/60", delay: 3900 },
      { text: "  [ AUDIO ONLINE ]  [ LYRICS ACTIVE ]", color: "text-cyan-400 font-bold", delay: 4000 },
      { text: "━".repeat(30), color: "text-cyan-500/60", delay: 4100 },
      { text: "", delay: 4200 },
      { text: "NOW PLAYING:", color: "text-purple-500 font-bold", delay: 4400 },
      { text: `  ${songInfo?.title || "Unknown"} — ${songInfo?.artist || "Unknown"}`, color: "text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", delay: 4600 },
      { text: "", delay: 4800 },
    ];

    const lyrics = extractLyrics();
    let currentDelay = 5200;

    lyrics.forEach((lyric, idx) => {
      bootSequence.push({
        text: `  >  ${lyric}`,
        color: idx === 0 ? "text-green-400 font-bold" : "text-slate-400",
        delay: currentDelay,
      });
      currentDelay += 1800; // Slower, more readable pacing
    });

    const runSequence = () => {
      bootSequence.forEach((step, idx) => {
        const id = setTimeout(() => {
          if (!isMounted) return;
          if (step.clear) {
            setLines([]);
            setBooting(false);
          } else if (step.text !== undefined) {
            setLines((prev) => [...prev, { id: idx, text: step.text, color: step.color }]);
          }
        }, step.delay);
        timeoutIds.push(id);
      });
    };

    runSequence();

    return () => {
      isMounted = false;
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [songInfo, lrcContent]);

  // Auto scroll to bottom smoothly
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [lines]);

  return (
    <div className="glass-card p-1 border border-purple-500/30 overflow-hidden h-full relative group">
      {/* Dynamic shadow glow */}
      <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      {/* Terminal Title Bar */}
      <div className="bg-[#050811]/90 px-4 py-2.5 border-b border-purple-500/20 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </div>
        <div className="font-terminal text-xs text-purple-400/50 uppercase tracking-widest flex items-center gap-2">
          ~ / BIN / LYRICSHELL_OS
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={containerRef}
        className="bg-[#02040a] p-5 h-[340px] overflow-y-auto font-terminal text-sm scrollbar-thin scrollbar-thumb-purple-500/30 relative crt"
      >
        <div className="space-y-1.5 min-h-full">
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`${line.color || "text-slate-300"}`}
              >
                {line.text}
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="flex items-center mt-3 h-6">
            <span className="text-cyan-500 mr-2 font-bold">{booting ? ">" : ""}</span>
            <span className="w-2.5 h-5 bg-cyan-400 shadow-[0_0_8px_rgba(0,245,255,0.8)] blink inline-block"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
