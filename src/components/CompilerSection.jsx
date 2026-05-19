import React, { useState } from "react";
import GenerateButton from "./GenerateButton";
import DownloadSection from "./DownloadSection";

export default function CompilerSection({ songInfo, lrcContent }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [compiledFile, setCompiledFile] = useState(null); // { url, fileName }

  const handleCompile = async () => {
    setGenerating(true);
    setError(null);
    setCompiledFile(null);

    try {
      const response = await fetch("/_/backend/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: songInfo.title,
          artist: songInfo.artist,
          previewUrl: songInfo.previewUrl,
          duration: songInfo.duration,
          lrcContent: lrcContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Compilation failed on backend server.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const safeTitle = songInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const fileName = `lyricshell_${safeTitle}.py`;

      setCompiledFile({ url: downloadUrl, fileName });
    } catch (err) {
      console.error("[COMPILER ERROR]:", err);
      setError(err.message || "Failed to establish secure compiler connection.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {compiledFile ? (
        <div className="relative">
          <DownloadSection url={compiledFile.url} fileName={compiledFile.fileName} />
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setCompiledFile(null)}
              className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 font-terminal text-[10px] uppercase tracking-wider transition-all duration-300"
            >
              Compile Again
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 border border-cyan-500/20 relative overflow-hidden text-center space-y-6 shadow-[0_0_30px_rgba(0,245,255,0.03)]">
          {/* Laser accents */}
          <div className="absolute top-0 left-0 w-20 h-[2px] bg-cyan-400"></div>
          <div className="absolute top-0 left-0 w-[2px] h-20 bg-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-20 h-[2px] bg-purple-500"></div>
          <div className="absolute bottom-0 right-0 w-[2px] h-20 bg-purple-500"></div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-orbitron font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              &gt;_ CYBERPUNK COMPILER ENGINE
            </h2>
            <p className="text-slate-400 text-xs font-terminal leading-relaxed">
              ASSEMBLE AN INDEPENDENT STANDALONE PYTHON PLAYBACK PACKAGE EMBEDDED WITH HIGH-FIDELITY AUDIO DATA AND VECTOR SYNCED LYRIC MATRICES. RUNS OFFLINE DIRECTLY IN YOUR TERMINAL WITH RICH RETRO CRT VISUALS.
            </p>
          </div>

          <div className="flex justify-center py-4">
            <GenerateButton
              disabled={generating}
              generating={generating}
              onClick={handleCompile}
            />
          </div>

          {error && (
            <div className="border border-red-500/30 bg-red-950/20 rounded-lg p-3 max-w-md mx-auto text-center font-terminal text-xs text-red-400 animate-shake">
              [COMPILE_ERR] :: {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 font-terminal uppercase border-t border-slate-500/10 pt-4">
            <span>PACK ENCODING: BASE64 CHUNKS</span>
            <span className="text-cyan-500/30">•</span>
            <span>OS SPEC: WINDOWS/LINUX/MAC</span>
            <span className="text-cyan-500/30">•</span>
            <span>DECODER: PYGAME 2.0+</span>
          </div>
        </div>
      )}
    </div>
  );
}
