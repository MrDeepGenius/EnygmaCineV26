import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Cast, Tv2, RotateCcw, RotateCw, Gauge, Mic2, Captions } from "lucide-react";

interface Track {
  file: string;
  label: string;
  kind: string;
  default?: boolean;
}

interface VideoPlayerProps {
  hlsUrl: string;
  tracks?: Track[];
  title: string;
  logoUrl?: string;
  onBack: () => void;
  episodes?: { label: string; onSelect: () => void; active: boolean }[];
}

type BottomTab = "none" | "speed" | "quality" | "audio";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ hlsUrl, tracks, title, logoUrl, onBack, episodes }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [levels, setLevels] = useState<{ height: number; index: number }[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [audioTracks, setAudioTracks] = useState<{ name: string; index: number }[]>([]);
  const [currentAudio, setCurrentAudio] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bottomTab, setBottomTab] = useState<BottomTab>("none");
  const [speed, setSpeed] = useState(1);
  const [castAvailable, setCastAvailable] = useState(false);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 5000);
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    revealControls();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [revealControls]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (v && "remote" in v) setCastAvailable(true);
  }, []);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;
    setLoading(true);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (Hls.isSupported()) {
      const hls = new Hls({ startLevel: -1, autoStartLoad: true, enableWorker: true, backBufferLength: 90 });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(data.levels.map((l, i) => ({ height: l.height, index: i })));
        const aTracks = hls.audioTracks;
        setAudioTracks(aTracks.map((t, i) => ({ name: t.name || `Audio ${i + 1}`, index: i })));
        const spIdx = aTracks.findIndex(
          (t) => t.lang?.startsWith("es") || ["español","spanish","latino","spa"].some((k) => t.name?.toLowerCase().includes(k))
        );
        if (spIdx >= 0) { hls.audioTrack = spIdx; setCurrentAudio(spIdx); }
        setLoading(false);
        video.play().catch(() => setControlsVisible(true));
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, d) => setCurrentLevel(d.level));
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, d) => setCurrentAudio(d.id));
      hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) setLoading(false); });
      return () => { hls.destroy(); hlsRef.current = null; };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      const onMeta = () => { video.play().catch(() => {}); setLoading(false); };
      video.addEventListener("loadedmetadata", onMeta, { once: true });
      return () => video.removeEventListener("loadedmetadata", onMeta);
    }
    return undefined;
  }, [hlsUrl]);

  // Video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1));
    };
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); togglePlay(); revealControls(); }
      if (e.key === "ArrowRight") { skip(15); revealControls(); }
      if (e.key === "ArrowLeft") { skip(-15); revealControls(); }
      if (e.key === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const togglePlay = () => { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause(); };
  const toggleMute = () => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); };
  const skip = (s: number) => { const v = videoRef.current; if (!v) return; v.currentTime = Math.max(0, Math.min(duration, v.currentTime + s)); };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const setVolumeLevel = (v: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    video.muted = v === 0;
    setVolume(v);
    setMuted(v === 0);
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const setQuality = (level: number) => { if (hlsRef.current) hlsRef.current.currentLevel = level; setBottomTab("none"); };
  const setAudio = (idx: number) => { if (hlsRef.current) hlsRef.current.audioTrack = idx; setCurrentAudio(idx); setBottomTab("none"); };
  const setPlaybackSpeed = (s: number) => { const v = videoRef.current; if (v) v.playbackRate = s; setSpeed(s); setBottomTab("none"); };

  const castVideo = async () => {
    const video = videoRef.current;
    if (!video || !("remote" in video)) return;
    try { await (video as HTMLVideoElement & { remote: { prompt: () => Promise<void> } }).remote.prompt(); } catch {}
  };

  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;
  const currentQuality = currentLevel === -1 ? "Auto" : levels[currentLevel] ? `${levels[currentLevel].height}p` : "Auto";

  // Apply brightness filter to video
  const brightnessFilter = brightness !== 1 ? `brightness(${brightness})` : undefined;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-black select-none overflow-hidden"
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      style={{ cursor: controlsVisible ? "default" : "none" }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        style={{ filter: brightnessFilter }}
        onClick={(e) => { e.stopPropagation(); togglePlay(); revealControls(); }}
      >
        {tracks?.map((t, i) => (
          <track key={i} src={t.file} kind={t.kind as "subtitles" | "captions"} label={t.label} default={t.default} />
        ))}
      </video>

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-4">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={title}
              className="max-h-16 max-w-[220px] object-contain drop-shadow-[0_2px_16px_rgba(0,0,0,1)]"
            />
          )}
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-[#A855F7] border-t-transparent animate-spin" />
          </div>
        </div>
      )}

      {/* Big play/pause center (when paused and controls hidden) */}
      {!loading && !playing && !controlsVisible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/50 border-2 border-white/20 flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Bottom tab panel */}
      {bottomTab !== "none" && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Speed */}
          {bottomTab === "speed" && (
            <div className="flex items-center justify-center gap-2 py-4 px-4">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${speed === s ? "bg-[#A855F7] text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}
                >
                  {s === 1 ? "Normal" : `${s}x`}
                </button>
              ))}
            </div>
          )}
          {/* Quality */}
          {bottomTab === "quality" && (
            <div className="flex items-center justify-center gap-2 py-4 px-4 flex-wrap">
              <button
                onClick={() => setQuality(-1)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${currentLevel === -1 ? "bg-[#A855F7] text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}
              >
                Auto
              </button>
              {[...levels].reverse().map((l) => (
                <button
                  key={l.index}
                  onClick={() => setQuality(l.index)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${currentLevel === l.index ? "bg-[#A855F7] text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}
                >
                  {l.height}p
                </button>
              ))}
            </div>
          )}
          {/* Audio */}
          {bottomTab === "audio" && (
            <div className="flex items-center justify-center gap-2 py-4 px-4 flex-wrap">
              {audioTracks.map((t) => (
                <button
                  key={t.index}
                  onClick={() => setAudio(t.index)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${currentAudio === t.index ? "bg-[#A855F7] text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}
                >
                  {t.name}
                </button>
              ))}
              {audioTracks.length === 0 && (
                <span className="text-white/30 text-sm">Solo una pista de audio disponible</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => { e.stopPropagation(); setBottomTab("none"); }}
      >
        {/* TOP BAR */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-8 bg-gradient-to-b from-black/80 via-black/20 to-transparent">
          <button
            onClick={onBack}
            className="text-white p-1"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[#A855F7] text-[10px] font-bold uppercase tracking-[0.25em]">Estas mirando</p>
            <p className="text-white font-semibold text-sm truncate">{title}</p>
          </div>
          <div className="flex items-center gap-3">
            {castAvailable && (
              <button onClick={castVideo} className="text-white/70 hover:text-white transition-colors">
                <Cast className="w-5 h-5" />
              </button>
            )}
            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MIDDLE AREA: sliders + center controls */}
        <div className="flex-1 flex items-center justify-between px-3">
          {/* LEFT: brightness slider */}
          <div
            className="flex flex-col items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-28 w-10 bg-white/10 rounded-full flex items-end overflow-hidden border border-white/10">
              <div
                className="w-full bg-[#A855F7] rounded-full transition-all"
                style={{ height: `${brightness * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0.3}
              max={1.5}
              step={0.05}
              value={brightness}
              onChange={(e) => setBrightness(parseFloat(e.target.value))}
              className="absolute opacity-0 w-10 h-28 cursor-pointer"
              style={{ writingMode: "vertical-lr", direction: "rtl" }}
            />
            <Settings className="w-5 h-5 text-white/50" />
          </div>

          {/* CENTER: skip + play */}
          <div className="flex items-center gap-8 md:gap-14" onClick={(e) => e.stopPropagation()}>
            {/* Skip back */}
            <button
              onClick={() => skip(-15)}
              className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform"
            >
              <div className="relative">
                <RotateCcw className="w-10 h-10" strokeWidth={1.5} />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold mt-0.5">15</span>
              </div>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center active:scale-90 transition-transform"
            >
              {playing
                ? <Pause className="w-7 h-7 text-white fill-white" />
                : <Play className="w-7 h-7 text-white fill-white ml-1" />
              }
            </button>

            {/* Skip forward */}
            <button
              onClick={() => skip(15)}
              className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform"
            >
              <div className="relative">
                <RotateCw className="w-10 h-10" strokeWidth={1.5} />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold mt-0.5">15</span>
              </div>
            </button>
          </div>

          {/* RIGHT: volume slider */}
          <div
            className="flex flex-col items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-28 w-10 bg-white/10 rounded-full flex items-end overflow-hidden border border-white/10">
              <div
                className="w-full bg-[#A855F7] rounded-full transition-all"
                style={{ height: `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="absolute opacity-0 w-10 h-28 cursor-pointer"
              style={{ writingMode: "vertical-lr", direction: "rtl" }}
            />
            <button onClick={toggleMute} className="text-white/50">
              {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Episode row */}
        {episodes && episodes.length > 1 && (
          <div className="px-4 pb-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {episodes.map((ep, i) => (
                <button
                  key={i}
                  onClick={ep.onSelect}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${ep.active ? "bg-[#A855F7] text-white" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"}`}
                >
                  {ep.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM: progress + time */}
        <div
          className="bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-8 pb-3 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white text-sm font-mono tabular-nums w-12 text-right">{fmt(currentTime)}</span>
            <div
              className="flex-1 relative h-1 bg-white/20 rounded-full cursor-pointer group hover:h-2 transition-all"
              onClick={seekTo}
            >
              <div className="absolute left-0 top-0 h-full bg-white/20 rounded-full" style={{ width: `${bufPct}%` }} />
              <div className="absolute left-0 top-0 h-full bg-[#A855F7] rounded-full" style={{ width: `${pct}%` }} />
              <div
                className="absolute top-1/2 w-3 h-3 rounded-full bg-white -translate-y-1/2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${pct}% - 6px)` }}
              />
            </div>
            <span className="text-white/50 text-sm font-mono tabular-nums w-12">{fmt(duration)}</span>
          </div>

          {/* Bottom tabs */}
          <div className="flex items-center justify-center gap-1 mt-1">
            <button
              onClick={() => setBottomTab(bottomTab === "speed" ? "none" : "speed")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${bottomTab === "speed" ? "text-[#A855F7]" : "text-white/50 hover:text-white"}`}
            >
              <Gauge className="w-4 h-4" />
              Velocidad
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => setBottomTab(bottomTab === "quality" ? "none" : "quality")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${bottomTab === "quality" ? "text-[#A855F7]" : "text-white/50 hover:text-white"}`}
            >
              <Captions className="w-4 h-4" />
              {currentQuality}
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => setBottomTab(bottomTab === "audio" ? "none" : "audio")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${bottomTab === "audio" ? "text-[#A855F7]" : "text-white/50 hover:text-white"}`}
            >
              <Mic2 className="w-4 h-4" />
              Idioma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
