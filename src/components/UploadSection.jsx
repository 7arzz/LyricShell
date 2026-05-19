import React, { useState, useRef } from "react";

export default function UploadSection({ onLrcUpload, onLrcClear, onLrcContentChange, lrcFile, lrcContent, lyricsLoading }) {
  const [activeTab, setActiveTab] = useState("timeline"); // "timeline" | "editor"
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Parse LRC for preview: [[timeString, text], ...]
  const getParsedPreview = () => {
    if (!lrcContent) return [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    const lines = lrcContent.split("\n");
    const parsed = [];
    for (let line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        const timeStr = `[${match[1]}:${match[2]}.${match[3].substring(0, 2)}]`;
        const text = line.replace(timeRegex, "").trim();
        if (text) {
          parsed.push({ timeStr, text });
        }
      }
    }
    return parsed.slice(0, 20); // Show up to 20 lines preview
  };

  const parsedLines = getParsedPreview();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".lrc")) {
        onLrcUpload(file);
      } else {
        alert("System error: Only .lrc lyric files are accepted.");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".lrc")) {
        onLrcUpload(file);
      } else {
        alert("System error: Only .lrc lyric files are accepted.");
      }
    }
  };

  return (
    <div className="glass-card p-6 border border-purple-500/20 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Design accents */}
      <div className="absolute top-0 right-0 w-16 h-[2px] bg-purple-500"></div>
      <div className="absolute top-0 right-0 w-[2px] h-16 bg-purple-500"></div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-orbitron font-bold tracking-widest text-purple-400 flex items-center gap-2">
            <span>&gt;_</span> SYNCHRONIZED LYRICS
          </h2>
          <p className="text-slate-400 text-xs font-terminal mt-1">
            UPLOAD OR MANUALLY CONFIGURE SINKRON LRC TIMINGS FOR TERMINAL PLAYER
          </p>
        </div>

        {/* Loading / Processing State */}
        {lyricsLoading ? (
          <div className="flex flex-col items-center justify-center p-8 min-h-[180px] border border-dashed border-purple-500/30 rounded-xl bg-purple-950/5 text-center">
            <div className="w-8 h-8 border-4 border-t-purple-500 border-purple-500/10 rounded-full animate-spin"></div>
            <p className="font-terminal text-xs text-purple-400 mt-4 animate-pulse">CONNECTING TO LRCLIB NETWORK...</p>
            <p className="font-terminal text-[10px] text-slate-500 mt-1">INTERCEPTING TELEMETRY & AUTO-RETRIEVING LRC SIGNAL</p>
          </div>
        ) : !lrcFile ? (
          /* Empty / Upload Drop Zone */
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition duration-300 min-h-[180px] ${
              isDragActive
                ? "border-cyan-400 bg-cyan-950/10 text-cyan-400 glow-cyan"
                : "border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/5 text-purple-400/80"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleChange}
              accept=".lrc"
              className="hidden"
            />
            <div className="mb-2 p-2.5 rounded-full bg-purple-500/5 text-purple-400">
              <svg className="w-7 h-7 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="font-terminal text-xs">DRAG & DROP .LRC SIGNAL HERE</p>
            <p className="text-[10px] text-slate-500 font-terminal mt-1">OR CLICK TO SCAN LOCAL ARCHIVE</p>
            
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  onLrcContentChange("[00:00.00] Booting lyric module...\n[00:04.00] Insert lyric line here");
                  setActiveTab("editor");
                }}
                className="px-3 py-1.5 border border-purple-500/30 bg-[#070b19]/60 hover:bg-purple-950/20 hover:border-purple-400 rounded-md text-[10px] font-terminal text-purple-400 transition"
              >
                + WRITE / PASTE RAW SIGNAL
              </button>
            </div>
          </div>
        ) : (
          /* File Loaded / Parser Preview & Editor Tabs State */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-purple-950/15 border border-purple-500/30 rounded-lg p-2.5">
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <div className="p-1.5 rounded bg-purple-500/10 text-purple-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <p className="font-terminal text-xs text-purple-300 truncate max-w-[100px] sm:max-w-[130px]" title={lrcFile.name}>
                    {lrcFile.name}
                  </p>
                  <p className="font-terminal text-[9px] text-slate-500">
                    {(lrcFile.size / 1024).toFixed(2)} KB // STATUS: DECODED
                  </p>
                </div>
              </div>

              {/* View/Editor toggle */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex border border-purple-500/30 rounded bg-[#070b19]/60 p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("timeline")}
                    className={`px-2 py-0.5 rounded-[3px] text-[9px] font-terminal transition ${
                      activeTab === "timeline"
                        ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,245,255,0.4)]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    TIMELINE
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("editor")}
                    className={`px-2 py-0.5 rounded-[3px] text-[9px] font-terminal transition ${
                      activeTab === "editor"
                        ? "bg-purple-600 text-white shadow-[0_0_8px_rgba(189,0,255,0.4)]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    EDITOR
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={onLrcClear}
                  className="text-slate-400 hover:text-red-400 p-1.5 rounded-full hover:bg-red-500/10 transition"
                  title="PURGE SIGNAL"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Display timeline stream or raw text editor */}
            {activeTab === "timeline" ? (
              /* Parsed Preview Scroll Area */
              <div className="border border-slate-500/10 bg-[#050811]/70 rounded-lg p-3 h-[180px] overflow-y-auto font-terminal text-xs space-y-2 scrollbar-thin scrollbar-thumb-purple-500/30">
                <div className="text-[10px] text-cyan-400/60 pb-1 border-b border-cyan-500/10 sticky top-0 bg-[#050811] z-10">
                  PARSED TIMELINE STREAM PREVIEW:
                </div>
                {parsedLines.length > 0 ? (
                  parsedLines.map((line, idx) => (
                    <div key={idx} className="flex gap-2 items-start py-0.5 hover:bg-slate-500/5 px-1 rounded transition">
                      <span className="text-cyan-400 font-bold select-none shrink-0">{line.timeStr}</span>
                      <span className="text-slate-300">{line.text}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic py-4 text-center text-[11px]">
                    No synced timed lyric records. Switch to EDITOR to paste or write plaintext lyrics.
                  </div>
                )}
                {parsedLines.length >= 20 && (
                  <div className="text-center text-[9px] text-purple-400/40 pt-2 border-t border-slate-500/5">
                    -- SIGNAL TRUNCATED FOR INTERFACE PREVIEW --
                  </div>
                )}
              </div>
            ) : (
              /* Raw LRC Text Editor */
              <div className="relative">
                <textarea
                  value={lrcContent}
                  onChange={(e) => onLrcContentChange(e.target.value)}
                  className="w-full h-[180px] bg-[#050811]/90 border border-purple-500/30 rounded-lg p-3 font-terminal text-xs text-purple-300 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 resize-none scrollbar-thin scrollbar-thumb-purple-500/30"
                  placeholder="Paste or write your LRC synced lyrics here:
[00:10.00] Line 1
[00:14.50] Line 2"
                />
                <div className="absolute bottom-2 right-3 text-[9px] text-purple-500/50 pointer-events-none font-terminal">
                  EDITABLE BUFFER MODE
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-purple-500/10 flex items-center justify-between text-[9px] text-slate-500 font-terminal">
        <span>ENCODING: UTF-8 ONLY</span>
        <span>LRC LYRIC ENGINE V1.0.8</span>
      </div>
    </div>
  );
}
