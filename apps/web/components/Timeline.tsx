"use client";

import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Music,
} from "lucide-react";
import type { PlaybackSpeed, BgMusic } from "../types";

interface TimelineProps {
  isPlaying: boolean;
  onTogglePlay?: () => void;
  onPlayPause?: () => void;
  onRestart?: () => void;
  speed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  currentTime?: number;
  totalDuration?: number;
  onSeek?: (time: number) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  bgMusic?: BgMusic;
  onBgMusicChange?: (music: BgMusic) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  scenes?: any;
  sceneCount?: number;
  activeSceneIndex?: number;
}

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const Timeline: React.FC<TimelineProps> = ({
  isPlaying,
  onTogglePlay,
  onPlayPause,
  onRestart,
  speed,
  onSpeedChange,
  currentTime = 0,
  totalDuration = 60,
  onSeek,
  isMuted,
  onToggleMute,
  bgMusic,
  onBgMusicChange,
  isFullscreen,
  onToggleFullscreen,
  sceneCount = 1,
  activeSceneIndex = 0,
}) => {
  const progressPercent =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (onSeek) onSeek(ratio * totalDuration);
  };

  return (
    <div className="h-12 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-4 flex items-center gap-3 z-30 select-none">
      {}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onRestart?.()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Restart"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => (onTogglePlay ? onTogglePlay() : onPlayPause?.())}
          className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-md shadow-sky-500/20"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      </div>

      {}
      <span className="text-[11px] font-mono text-slate-400 min-w-[70px]">
        {formatTime(currentTime)} / {formatTime(totalDuration)}
      </span>

      {}
      <div
        className="flex-1 h-1.5 bg-slate-800 rounded-full cursor-pointer group relative"
        onClick={handleScrub}
      >
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {}
        {sceneCount > 1 &&
          Array.from({ length: sceneCount - 1 }, (_, i) => {
            const markerPos = ((i + 1) / sceneCount) * 100;
            return (
              <div
                key={i}
                className="absolute top-0 w-0.5 h-full bg-slate-600"
                style={{ left: `${markerPos}%` }}
              />
            );
          })}
      </div>

      {}
      <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
        Scene {(activeSceneIndex || 0) + 1}/{sceneCount}
      </span>

      {}
      <div className="hidden sm:flex items-center gap-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
              speed === s
                ? "bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {}
      <button
        onClick={() => onToggleMute?.()}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>

      {}
      <div className="hidden md:flex items-center gap-1">
        <Music className="w-3 h-3 text-slate-500" />
        <select
          value={bgMusic || "none"}
          onChange={(e) => onBgMusicChange?.(e.target.value as BgMusic)}
          className="bg-transparent text-slate-400 text-[10px] focus:outline-none cursor-pointer"
        >
          <option value="none" className="bg-slate-900">Off</option>
          <option value="lofi" className="bg-slate-900">Lo-Fi</option>
          <option value="ambient" className="bg-slate-900">Ambient</option>
          <option value="rain" className="bg-slate-900">Rain</option>
        </select>
      </div>

      {}
      <button
        onClick={() => onToggleFullscreen?.()}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="w-3.5 h-3.5" />
        ) : (
          <Maximize2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
