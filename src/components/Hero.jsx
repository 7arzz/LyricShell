import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background glow orb */}
      <motion.div
        className="absolute w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10"
      >
        <motion.h1
          className="text-4.5xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-orbitron font-black gradient-text tracking-wider drop-shadow-[0_0_20px_rgba(0,245,255,0.8)]"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          LyricShell
        </motion.h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-6 sm:mt-8 text-sm sm:text-lg md:text-xl lg:text-2xl text-slate-300 font-terminal tracking-widest max-w-2xl mx-auto relative z-10"
      >
        Turn music into immersive <br className="hidden sm:block" />
        <span className="text-neon-cyan font-bold glow-cyan">
          terminal experiences.
        </span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-8 sm:mt-14 relative z-10"
      >
        <motion.a
          href="#search"
          className="btn-neon px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-lg font-bold flex items-center gap-3 bg-[#030712]/50 backdrop-blur-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="blink text-purple-400">_</span> INITIALIZE SYSTEM
        </motion.a>
      </motion.div>
    </section>
  );
}
