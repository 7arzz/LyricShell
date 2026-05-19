import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TerminalPlayer({ songInfo, lrcContent }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Fallback to 30s for Deezer preview
  const [isBooted, setIsBooted] = useState(false);
  const [booting, setBooting] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  
  const audioRef = useRef(null);
  const logContainerRef = useRef(null);
  const [sysLogs, setSysLogs] = useState([]);

  // Parse LRC or Plain Lyrics
  const parsedLyrics = React.useMemo(() => {
    if (!lrcContent) return [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    const parsed = [];
    const lines = lrcContent.split("\n").map(l => l.trim()).filter(Boolean);
    
    let hasSynced = false;
    for (let line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        hasSynced = true;
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        const msStr = match[3];
        const ms = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10);
        const totalSeconds = mins * 60 + secs + ms / 1000;
        const text = line.replace(timeRegex, "").trim();
        parsed.push({ time: totalSeconds, text });
      }
    }
    
    if (hasSynced) {
      return parsed.sort((a, b) => a.time - b.time);
    }
    
    // Plain text fallback (4s spacing)
    return lines.map((line, idx) => ({
      time: idx * 4,
      text: line
    }));
  }, [lrcContent]);

  // Find active lyric index
  const activeLyricIdx = React.useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    // Default to the first lyric (index 0) so the spotlight highlights immediately upon loading/playing
    let activeIdx = 0;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }, [parsedLyrics, currentTime]);

  // Handle song changed -> reset player
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setIsBooted(false);
    setBooting(false);
    setBootLines([]);
    setSysLogs(["[SYS] Integrated audio engine standby.", "[SYS] Signal source loaded."]);
  }, [songInfo]);

  // Add random diagnostic logs at intervals when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const logs = [
        `[SYS] Decoder latency: ${(Math.random() * 8 + 8).toFixed(1)}ms`,
        `[SYS] Audio buffer state: 100% (stable)`,
        `[SYS] Core sync offset: +0.00${Math.floor(Math.random() * 5)}s`,
        `[SYS] Video renderer FPS: ${(58 + Math.random() * 2).toFixed(1)}`,
        `[DECODER] Running spectrum analysis... OK`,
        `[SYS] Matrix thread: ACTIVE`
      ];
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setSysLogs(prev => [...prev.slice(-15), randomLog]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Auto scroll system log marquee
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [sysLogs]);

  // Trigger simulated boot sequence
  const startBootSequence = () => {
    setBooting(true);
    setBootLines([]);
    
    const makeHex = () => Array.from({length: 4}, () => Math.floor(Math.random()*65535).toString(16).padStart(4, '0').toUpperCase()).join(' ');
    
    const bootSteps = [
      { text: "> INITIALIZING LYRICSHELL KERNEL v1.0.8...", delay: 100 },
      { text: "[ SYSTEM READY ]", delay: 300 },
      { text: `> ALLOCATING MEMORY BLOCKS: ${makeHex()}`, delay: 450 },
      { text: `> ALLOCATING MEMORY BLOCKS: ${makeHex()}`, delay: 550 },
      { text: "[ OK ] AUDIO DECODER INTERFACE MOUNTED", delay: 700 },
      { text: "[ OK ] LYRIC CORRELATION ENGINE ACTIVE", delay: 900 },
      { text: "> MOUNTING EMBEDDED MEMORY BUFFER...", delay: 1100 },
      { text: "[ OK ] BOOT SEQUENCE COMPLETE. PLAYBACK READY.", delay: 1300 },
    ];

    bootSteps.forEach(step => {
      setTimeout(() => {
        setBootLines(prev => [...prev, step.text]);
        if (step.text.startsWith("[ OK ] BOOT")) {
          setTimeout(() => {
            setIsBooted(true);
            setBooting(false);
            setSysLogs(prev => [...prev, "[SYS] Boot complete. LyricShell interface active."]);
            // Auto play audio once boot is finished
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.error("Audio playback error:", e));
            }
          }, 300);
        }
      }, step.delay);
    });
  };

  const handlePlayPause = () => {
    if (!isBooted) {
      startBootSequence();
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setSysLogs(prev => [...prev, "[SYS] Audio playback halted."]);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setSysLogs(prev => [...prev, "[SYS] Audio playback resumed."]);
          })
          .catch(e => console.error("Playback error:", e));
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setSysLogs(prev => [...prev, "[SYS] Audio stream terminated by user."]);
  };

  const handleReboot = () => {
    handleStop();
    setIsBooted(false);
    setBooting(false);
    setBootLines([]);
    setSysLogs(["[SYS] System hot-reboot sequence initialized."]);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setSysLogs(prev => [...prev, `[SYS] Audio seek to ${time.toFixed(1)}s`]);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Generate ASCII progress bar
  const getProgressBar = () => {
    const totalBars = 26;
    const ratio = duration > 0 ? currentTime / duration : 0;
    const filledBars = Math.min(Math.floor(ratio * totalBars), totalBars);
    const emptyBars = totalBars - filledBars;
    return "■".repeat(filledBars) + "□".repeat(emptyBars);
  };

  // Render lyric lines around active line
  const renderLyricsList = () => {
    if (parsedLyrics.length === 0) {
      return (
        <div className="text-cyan-500/40 text-center py-8 font-terminal text-xs uppercase tracking-wider animate-pulse">
          ♪  [LYRICS OFFLINE] No LRC file was uploaded  ♪
        </div>
      );
    }

    // Always render the scrolling list for maximum visual feedback.
    // We show the active lyric at the center, with 1 past line and up to 3 upcoming lines.
    const startIdx = Math.max(0, activeLyricIdx - 1);
    const endIdx = Math.min(parsedLyrics.length, activeLyricIdx + 4);
    const slice = parsedLyrics.slice(startIdx, endIdx);

    return (
      <div className="space-y-2.5 flex flex-col justify-center min-h-[120px]">
        {slice.map((lyric, idx) => {
          const absoluteIdx = startIdx + idx;
          const isActive = absoluteIdx === activeLyricIdx;
          
          if (isActive) {
            return (
              <motion.div
                key={absoluteIdx}
                layoutId="activeLyricLine"
                className="bg-green-500 text-black px-4 py-2 rounded font-terminal font-bold text-sm shadow-[0_0_15px_rgba(34,197,94,0.65)] flex items-center relative overflow-hidden"
              >
                {/* Horizontal scanline over spotlight line */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none"></div>
                <span className="mr-2 text-black shrink-0 animate-pulse">▶</span>
                <span className="truncate">{lyric.text}</span>
              </motion.div>
            );
          } else {
            return (
              <div
                key={absoluteIdx}
                className="text-slate-400/70 font-terminal text-xs pl-8 truncate opacity-60 transition-all duration-300 hover:opacity-100 py-0.5"
              >
                {lyric.text}
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="glass-card p-1 border border-cyan-500/30 overflow-hidden h-full relative group shadow-[0_0_25px_rgba(0,245,255,0.05)] flex flex-col justify-between">
      {/* Background audio element */}
      <audio
        ref={audioRef}
        src={songInfo?.previewUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 30)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          setSysLogs(prev => [...prev, "[SYS] Playback completed automatically."]);
        }}
        preload="auto"
      />

      {/* Terminal Title Header */}
      <div className="bg-[#050811]/90 px-4 py-2 border-b border-cyan-500/20 flex items-center justify-between backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 glow-cyan animate-pulse"></span>
          <span className="font-orbitron text-xs font-bold tracking-widest text-cyan-400">
            LYRICSHELL // HARDWARE_EMULATOR
          </span>
        </div>
        <div className="font-terminal text-[10px] text-cyan-400/50 uppercase tracking-widest flex items-center gap-2">
          SIGNAL READY // {formatTime(currentTime)}
        </div>
      </div>

      {/* CRT Terminal Screen */}
      <div className="bg-[#02040a] p-4 flex-1 flex flex-col min-h-[360px] font-terminal relative crt overflow-hidden">
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-cyan-500/[0.015] pointer-events-none z-10 animate-flicker"></div>

        <AnimatePresence mode="wait">
          {/* SCREEN STATE 1: System Power Standby */}
          {!isBooted && !booting && (
            <motion.div
              key="powerOff"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-6 z-10 py-12"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border border-cyan-500/20 flex items-center justify-center glow-cyan bg-cyan-500/5 hover:bg-cyan-500/10 cursor-pointer transition-all duration-300 group-hover:scale-105" onClick={handlePlayPause}>
                  <svg className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_#00f5ff]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
                  </svg>
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-500 animate-ping"></span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-cyan-400 tracking-widest uppercase">
                  [ KERNEL IS STANDBY ]
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Select a song and click core power to engage system
                </p>
              </div>
            </motion.div>
          )}

          {/* SCREEN STATE 2: System Boot Sequence */}
          {booting && (
            <motion.div
              key="booting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-start space-y-1.5 font-terminal text-[11px] text-cyan-400 z-10 overflow-y-auto pt-2"
            >
              {bootLines.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  {line}
                </div>
              ))}
              <div className="flex items-center mt-2 h-4">
                <span className="text-cyan-400 mr-2 font-bold">&gt;</span>
                <span className="w-2 h-4 bg-cyan-400 shadow-[0_0_8px_#00f5ff] blink inline-block"></span>
              </div>
            </motion.div>
          )}

          {/* SCREEN STATE 3: Live Player Console */}
          {isBooted && (
            <motion.div
              key="liveConsole"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-between z-10 space-y-4 pt-2"
            >
              {/* Header Box */}
              <div>
                <div className="text-cyan-500/50 text-[10px] tracking-widest uppercase flex justify-between">
                  <span>━ OS_v1.0.8 ━━━━━━━━━━━━━━━━━━━━━━━━━</span>
                  <span className="text-green-500 animate-pulse">[ AUDIO ENGINE ONLINE ]</span>
                </div>
                
                {/* Now Playing */}
                <div className="mt-3 flex gap-4 items-center">
                  <div className="relative w-12 h-12 rounded border border-purple-500/30 overflow-hidden shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                    <img src={songInfo?.albumCover} alt={songInfo?.title} className="w-full h-full object-cover" />
                    {isPlaying && <div className="absolute inset-0 bg-cyan-500/20 mix-blend-color animate-pulse"></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">NOW PLAYING:</div>
                    <div className="text-sm font-bold text-slate-100 truncate tracking-wide">{songInfo?.title}</div>
                    <div className="text-xs text-cyan-400/70 truncate">{songInfo?.artist}</div>
                  </div>
                  
                  {/* Dynamic Spectrogram visualizer block */}
                  <div className="flex items-end gap-[2px] h-8 shrink-0 px-2 border-l border-slate-800">
                    {Array.from({ length: 9 }).map((_, i) => {
                      const heights = isPlaying 
                        ? [20, 80, 40, 100, 60, 90, 30, 70, 50]
                        : [10, 10, 10, 10, 10, 10, 10, 10, 10];
                      const animDur = [0.4, 0.6, 0.5, 0.7, 0.3, 0.5, 0.6, 0.4, 0.5];
                      
                      return (
                        <div
                          key={i}
                          className="w-[3px] bg-cyan-400 shadow-[0_0_6px_#00f5ff]"
                          style={{
                            height: isPlaying ? "100%" : "3px",
                            transform: isPlaying ? `scaleY(${heights[i] / 100})` : 'none',
                            transformOrigin: "bottom",
                            animation: isPlaying ? `eqJiggler ${animDur[i]}s ease-in-out infinite alternate` : 'none',
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Scrolling Lyrics Subpanel */}
              <div className="border border-purple-500/20 rounded bg-[#03060f]/80 p-3 min-h-[140px] flex flex-col justify-center relative overflow-hidden group/lyrics shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
                {/* Horizontal scanner light */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none select-none z-10 animate-scanline"></div>
                {renderLyricsList()}
              </div>

              {/* Console Progress Bar & Time Registers */}
              <div className="space-y-1 bg-[#050811]/40 p-2.5 rounded border border-cyan-500/10">
                <div className="flex justify-between items-center text-[10px] text-cyan-500/50 uppercase tracking-widest font-mono">
                  <span>[ AUDIO REGISTER ]</span>
                  <span>FREQ: 44.1 KHZ // BITRATE: 128KBPS</span>
                </div>
                
                {/* Custom ASCII seekable slider */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-cyan-400/80 font-mono shrink-0 select-none">
                    [{getProgressBar()}]
                  </span>
                  
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-4 appearance-none bg-slate-900 rounded border border-cyan-500/20 cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_#00f5ff] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-cyan-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between font-terminal text-[11px] text-slate-500 font-mono">
                  <span>REG_CURR: {formatTime(currentTime)}</span>
                  <span className="text-cyan-400/40">LOCK: SYNC_OK</span>
                  <span>REG_MAX: {formatTime(duration)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Terminal Diagnostic Logs (Marquee Footer) */}
      <div 
        ref={logContainerRef}
        className="bg-[#03060f]/90 h-[50px] border-t border-cyan-500/20 p-2 overflow-y-auto font-terminal text-[9px] text-slate-500 uppercase tracking-wider relative select-none scrollbar-none"
      >
        <div className="space-y-0.5">
          {sysLogs.map((log, i) => (
            <div key={i} className="truncate">
              {log}
            </div>
          ))}
          {sysLogs.length === 0 && <div>[SYS] Core diagnostic channel loaded.</div>}
        </div>
      </div>

      {/* Mechanical Button Controls Panel */}
      <div className="bg-[#050811]/90 p-3 border-t border-cyan-500/20 flex flex-wrap justify-between items-center gap-3 relative z-10 backdrop-blur-md">
        <div className="flex gap-2">
          {/* Main ENGAGE/HALT switch */}
          <button
            onClick={handlePlayPause}
            disabled={booting}
            className={`px-4 py-2 rounded font-orbitron font-bold text-[10px] tracking-wider transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isPlaying
                ? "bg-purple-600 text-white shadow-[0_0_15px_#a855f7] hover:bg-purple-500"
                : "bg-cyan-500 text-black shadow-[0_0_15px_#06b6d4] hover:bg-cyan-400"
            }`}
          >
            {booting ? (
              <>
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                BOOTING...
              </>
            ) : isPlaying ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                HALT STREAM
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                ENGAGE SYSTEM
              </>
            )}
          </button>

          {/* STOP button */}
          <button
            onClick={handleStop}
            disabled={!isBooted || booting}
            className="px-3 py-2 rounded bg-slate-900 border border-red-500/40 text-red-500/80 hover:bg-red-950/20 hover:text-red-400 font-orbitron font-bold text-[10px] tracking-wider transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            TERMINATE
          </button>
        </div>

        {/* Reboot register button */}
        <button
          onClick={handleReboot}
          disabled={booting}
          className="px-3 py-2 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 font-orbitron font-bold text-[10px] tracking-wider transition-all duration-300 disabled:opacity-30"
        >
          SYS_REBOOT
        </button>
      </div>

      {/* Global CSS Inject for visualizer animations */}
      <style>{`
        @keyframes eqJiggler {
          0% { transform: scaleY(0.1); }
          100% { transform: scaleY(1); }
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
