import React, { useState, useRef, useEffect } from "react";

export default function PreviewSection({ songInfo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Deezer preview is exactly 30s
  const audioRef = useRef(null);

  useEffect(() => {
    // If songInfo changes, reload the audio player
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [songInfo]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Audio playback error:", e));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 30);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (time) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = (currentTime / duration) * 100 || 0;

  return (
    <div className="glass-card p-6 border border-cyan-500/20 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Laser red top bar accent */}
      <div className="absolute top-0 left-0 w-16 h-[2px] bg-cyan-400"></div>
      <div className="absolute top-0 left-0 w-[2px] h-16 bg-cyan-400"></div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-orbitron font-bold tracking-widest text-cyan-400 flex items-center gap-2">
            <span>&gt;_</span> AUDIO SIGNAL INTEGRATOR
          </h2>
          <p className="text-slate-400 text-xs font-terminal mt-1">
            VERIFY HIGH-FIDELITY ENCODING WAVEFORM PRIOR TO SOURCE EXPORT
          </p>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={songInfo.previewUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          preload="auto"
        />

        {/* Dashboard Display */}
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {/* Glowing Album Art Frame */}
          <div className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-cyan-500/30 bg-black glow-cyan">
            <img
              src={songInfo.albumCover}
              alt={songInfo.title}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-cyan-500/10 mix-blend-color animate-pulse pointer-events-none"></div>
            )}
          </div>

          {/* Metadata info */}
          <div className="flex-1 w-full space-y-3">
            <div>
              <div className="font-terminal text-[10px] text-cyan-400/50 uppercase tracking-widest">
                SIGNAL STATE: {isPlaying ? "ACTIVE" : "STANDBY"}
              </div>
              <h3 className="font-orbitron font-bold text-lg text-slate-100 tracking-wide mt-1 truncate max-w-full sm:max-w-[280px]">
                {songInfo.title}
              </h3>
              <p className="font-terminal text-sm text-purple-400 truncate max-w-full sm:max-w-[280px]">
                {songInfo.artist}
              </p>
            </div>

            {/* Custom equalizer bar animation */}
            <div className="flex items-center gap-1.5 h-8">
              {isPlaying ? (
                <>
                  <div className="eq-bar" style={{ animationDuration: "0.6s" }}></div>
                  <div className="eq-bar" style={{ animationDuration: "0.8s" }}></div>
                  <div className="eq-bar" style={{ animationDuration: "0.5s" }}></div>
                  <div className="eq-bar" style={{ animationDuration: "0.7s" }}></div>
                  <div className="eq-bar" style={{ animationDuration: "0.9s" }}></div>
                  <div className="eq-bar" style={{ animationDuration: "0.6s" }}></div>
                </>
              ) : (
                <div className="flex gap-1.5 items-end h-8">
                  <div className="w-[3px] h-[4px] bg-slate-700 rounded-xs"></div>
                  <div className="w-[3px] h-[4px] bg-slate-700 rounded-xs"></div>
                  <div className="w-[3px] h-[4px] bg-slate-700 rounded-xs"></div>
                  <div className="w-[3px] h-[4px] bg-slate-700 rounded-xs"></div>
                  <div className="w-[3px] h-[4px] bg-slate-700 rounded-xs"></div>
                  <div className="w-[3px] h-[4px] bg-slate-700 rounded-xs"></div>
                </div>
              )}
              <span className="font-terminal text-[10px] text-slate-500 uppercase tracking-wider ml-2">
                {isPlaying ? "WAVEFORM DETECTED" : "NO SPECTRUM SIGNAL"}
              </span>
            </div>
          </div>
        </div>

        {/* Custom futuristic slider controls */}
        <div className="space-y-2">
          <div className="relative">
            {/* Background cyan track */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[3px] bg-slate-800 rounded-full pointer-events-none"></div>
            {/* Active cyan fill */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-[3px] bg-cyan-500 rounded-full pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            ></div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full h-6 appearance-none bg-transparent cursor-pointer relative z-10 focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00f5ff] [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-125"
            />
          </div>

          <div className="flex justify-between font-terminal text-[11px] text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span className="text-cyan-400/40">BUFFER: 100%</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center gap-4">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 py-2 px-6 rounded-lg text-xs font-orbitron font-bold tracking-wider transition ${
            isPlaying
              ? "bg-purple-600 text-white shadow-[0_0_15px_#bd00ff] hover:bg-purple-500"
              : "bg-cyan-500 text-black shadow-[0_0_15px_#00f5ff] hover:bg-cyan-400"
          }`}
        >
          {isPlaying ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              HALT STREAM
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              ENGAGE MONITOR
            </>
          )}
        </button>

        <div className="font-terminal text-[10px] text-slate-500 uppercase">
          FREQ: 44.1 KHZ // bitrate: 128kbps
        </div>
      </div>
    </div>
  );
}
