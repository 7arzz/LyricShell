import React, { useState, useRef } from "react";

export default function UploadSection({ onLrcUpload, onLrcClear, lrcFile, lrcContent }) {
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
            UPLOAD OPTIONAL TIMED LRC SIGNAL FILE FOR TERMINAL CONCORDANCE
          </p>
        </div>

        {/* Upload Zone */}
        {!lrcFile ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition duration-300 min-h-[180px] ${
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
            <div className="mb-3 p-3 rounded-full bg-purple-500/5 text-purple-400">
              <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="font-terminal text-sm">DRAG & DROP .LRC SIGNAL HERE</p>
            <p className="text-xs text-slate-500 font-terminal mt-1">OR CLICK TO BROWSE LOCAL STORAGE ARRAYS</p>
            <p className="text-[10px] text-purple-400/40 font-terminal mt-3">ACCEPTED FORMAT: .LRC ONLY</p>
          </div>
        ) : (
          /* File Loaded / Parser Preview State */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-purple-950/15 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-purple-500/10 text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <p className="font-terminal text-sm text-purple-300 truncate max-w-[200px] sm:max-w-[280px]">
                    {lrcFile.name}
                  </p>
                  <p className="font-terminal text-[10px] text-slate-500">
                    {(lrcFile.size / 1024).toFixed(2)} KB // STATUS: DECODED
                  </p>
                </div>
              </div>
              <button
                onClick={onLrcClear}
                className="text-slate-400 hover:text-red-400 p-1.5 rounded-full hover:bg-red-500/10 transition"
                title="PURGE SIGNAL"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Parsed Preview Scroll Area */}
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
                <div className="text-slate-500 italic py-4 text-center">
                  Failed to extract timed lyric records. Ensure LRC formatting is: [mm:ss.xx] Lyric Text
                </div>
              )}
              {parsedLines.length >= 20 && (
                <div className="text-center text-[10px] text-purple-400/40 pt-2 border-t border-slate-500/5">
                  -- SIGNAL TRUNCATED FOR INTERFACE PREVIEW --
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-purple-500/10 flex items-center justify-between text-[10px] text-slate-500 font-terminal">
        <span>ENCODING: UTF-8 ONLY</span>
        <span>LRC LYRIC ENGINE V1.0.8</span>
      </div>
    </div>
  );
}
