import React from "react";

export default function DownloadSection({ url, fileName }) {
  const triggerDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass-card p-6 border border-green-500/20 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Green cyber accents */}
      <div className="absolute top-0 left-0 w-16 h-[2px] bg-green-400"></div>
      <div className="absolute top-0 left-0 w-[2px] h-16 bg-green-400"></div>

      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-orbitron font-bold tracking-widest text-green-400 flex items-center gap-2">
            <span>&gt;_</span> COMPILE COMPLETE
          </h2>
          <p className="text-slate-400 text-xs font-terminal mt-1">
            STANDALONE OFFLINE EMULATOR PACKAGE HAS BEEN ASSEMBLED
          </p>
        </div>

        {/* Status Dashboard */}
        <div className="bg-green-950/10 border border-green-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3 text-green-400">
            <div className="p-2 bg-green-500/10 rounded-full animate-pulse">
              <svg className="w-6 h-6 glow-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="font-terminal text-xs text-green-500/60 uppercase">BUILD STATUS</span>
              <p className="font-orbitron font-bold text-sm tracking-wide text-green-400">INTEGRITY VERIFIED</p>
            </div>
          </div>

          <div className="border-t border-green-500/20 pt-3 font-terminal text-xs space-y-1.5 text-slate-300">
            <div>
              <span className="text-green-500/50">FILE IDENTIFIER:</span> <span className="text-slate-100">{fileName}</span>
            </div>
            <div>
              <span className="text-green-500/50">PLATFORM ARCH:</span> <span className="text-slate-100">PYTHON3 + PYGAME</span>
            </div>
            <div>
              <span className="text-green-500/50">OFFLINE SYNC:</span> <span className="text-slate-100">ENABLED (BASE64 BUFFERED)</span>
            </div>
          </div>
        </div>

        {/* Execution Commands instruction */}
        <div className="border border-slate-500/10 bg-[#050811]/90 rounded-lg p-3 space-y-2">
          <div className="font-terminal text-[10px] text-cyan-400/60 uppercase">
            HOW TO RUN TERMINAL PLAYER:
          </div>
          <div className="font-terminal text-[11px] text-slate-400 space-y-1">
            <p>1. Install required packages in shell:</p>
            <div className="bg-black/60 p-2 rounded text-cyan-400 border border-cyan-950 font-mono select-all">
              pip install pygame rich colorama
            </div>
            <p className="mt-2">2. Execute generated player:</p>
            <div className="bg-black/60 p-2 rounded text-purple-400 border border-purple-950 font-mono select-all">
              python {fileName}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={triggerDownload}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-xs font-orbitron font-bold tracking-widest bg-green-500 text-black shadow-[0_0_15px_rgba(57,255,20,0.4)] hover:bg-green-400 hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] transition duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          DOWNLOAD EXECUTABLE (.PY)
        </button>
      </div>
    </div>
  );
}
