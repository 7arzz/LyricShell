import React from "react";
import { motion } from "framer-motion";

export default function GenerateButton({ disabled, generating, onClick }) {
  return (
    <motion.button
      whileHover={!disabled && !generating ? { scale: 1.05 } : {}}
      whileTap={!disabled && !generating ? { scale: 0.95 } : {}}
      disabled={disabled || generating}
      onClick={onClick}
      className={`btn-neon px-12 py-5 rounded-xl font-orbitron text-lg font-black tracking-widest uppercase transition-colors duration-300 relative group overflow-hidden ${
        disabled
          ? "opacity-35 cursor-not-allowed border-slate-700 text-slate-500 glow-none"
          : "border-cyan-400 text-cyan-400 glow-cyan"
      }`}
    >
      {/* Glitch hover background accents */}
      {!disabled && (
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      )}

      {generating ? (
        <span className="flex items-center justify-center gap-3 relative z-10">
          <svg className="w-5 h-5 animate-spin text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          GENERATING COMPILED SCRIPT...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-3 relative z-10">
          <span className="blink text-purple-400 font-bold">&gt;</span>
          COMPILE STANDALONE PYTHON OS
        </span>
      )}

      {/* Cyberpunk subtext */}
      {!disabled && !generating && (
        <span className="absolute bottom-1 left-0 right-0 text-[8px] font-terminal text-cyan-400/40 text-center tracking-widest pointer-events-none">
          PACK MP3 BASE64 & LRC VECTOR CHUNKS INTO EXECUTABLE FILE
        </span>
      )}
    </motion.button>
  );
}
