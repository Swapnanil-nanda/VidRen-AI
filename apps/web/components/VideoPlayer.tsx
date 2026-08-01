"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Volume1, Volume, Download, RefreshCw, Sparkles, Play, Pause, Maximize, Minimize, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { ScenePlan, VideoProject } from "../types";
import { createFrameRenderer } from "../lib/sceneRenderer";
import { speakNarration, speakMasterScriptContinuously, stopNarration, initSpeechSynthesis, playAudioChime } from "../lib/speechSynthesis";
import { buildLinearMasterScript } from "../lib/linearNarrativeEngine";

interface VideoPlayerProps {
  project?: VideoProject;
  scenes?: ScenePlan[];
  videoUrl?: string | null;
  narrationSegments: { text: string; startTime: number; duration: number }[];
  onRegenerate?: () => void;
  onNewPrompt?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  scenes: providedScenes,
  videoUrl,
  narrationSegments,
  onRegenerate,
  onNewPrompt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scenesList: ScenePlan[] = project?.scenes || providedScenes || [];
  const totalDuration = scenesList.reduce((sum, s) => sum + (s.duration || 10), 0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const activeSceneIndexRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Resize listener for crisp retina canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const height = Math.round(width * (9 / 16));
        const canvas = canvasRef.current;
        if (canvas) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.scale(dpr, dpr);
          }
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute current scene and timestamp from global currentTime
  const getCurrentSceneAndTimestamp = useCallback(
    (t: number) => {
      let accumulated = 0;
      for (let i = 0; i < scenesList.length; i++) {
        const dur = scenesList[i].duration || 10;
        if (t >= accumulated && t < accumulated + dur) {
          return { scene: scenesList[i], sceneIndex: i, localTime: t - accumulated, sceneDuration: dur };
        }
        accumulated += dur;
      }
      const lastIdx = Math.max(0, scenesList.length - 1);
      const lastScene = scenesList[lastIdx];
      return {
        scene: lastScene,
        sceneIndex: lastIdx,
        localTime: lastScene ? lastScene.duration || 10 : 10,
        sceneDuration: lastScene ? lastScene.duration || 10 : 10,
      };
    },
    [scenesList]
  );

  // Live Canvas Rendering Frame Loop (60 FPS fluid rendering)
  const renderFrame = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      if (!canvas || scenesList.length === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const { scene, localTime, sceneDuration } = getCurrentSceneAndTimestamp(t);

      if (scene) {
        ctx.clearRect(0, 0, width, height);
        const frameRenderer = createFrameRenderer(scene, {
          width,
          height,
          fps: 60,
          style: "modern",
        });
        frameRenderer(ctx, localTime, sceneDuration);
      }
    },
    [scenesList, getCurrentSceneAndTimestamp]
  );

  // Animation Loop for live playback
  useEffect(() => {
    let active = true;

    const loop = (now: number) => {
      if (!active) return;

      if (isPlaying) {
        if (lastTimeRef.current === 0) lastTimeRef.current = now;
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          const nextTime = prev + delta;
          if (nextTime >= totalDuration) {
            setIsPlaying(false);
            stopNarration();
            lastTimeRef.current = 0;
            return totalDuration;
          }
          // Continuous linear script speech narration (NO per-scene restarts or audio pauses!)
          const masterScript = buildLinearMasterScript(scenesList, project?.prompt || "");
          const { sceneIndex } = getCurrentSceneAndTimestamp(nextTime);
          if (sceneIndex !== activeSceneIndexRef.current) {
            activeSceneIndexRef.current = sceneIndex;
          }

          return nextTime;
        });
      } else {
        lastTimeRef.current = 0;
      }

      renderFrame(currentTime);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentTime, totalDuration, renderFrame, getCurrentSceneAndTimestamp, isMuted, volume]);

  const togglePlay = () => {
    initSpeechSynthesis();
    if (isPlaying) {
      setIsPlaying(false);
      stopNarration();
    } else {
      if (currentTime >= totalDuration) {
        setCurrentTime(0);
        activeSceneIndexRef.current = 0;
      }
      setIsPlaying(true);
      const masterScript = buildLinearMasterScript(scenesList, project?.prompt || "");
      const voice = project?.voiceover || "nova";
      speakMasterScriptContinuously(masterScript, voice, isMuted, 1, volume);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    stopNarration();
    const { sceneIndex, scene } = getCurrentSceneAndTimestamp(newTime);
    activeSceneIndexRef.current = sceneIndex;
    if (isPlaying && scene) {
      speakNarration(scene.narration, "nova", isMuted, 1, volume);
    }
  };

  const handleTestSound = () => {
    initSpeechSynthesis();
    playAudioChime(880, 200, 0.4);
    const sampleText =
      scenesList[activeSceneIndexRef.current]?.narration ||
      narrationSegments[0]?.text ||
      "Voiceover audio is working perfectly.";
    speakNarration(sampleText, "nova", false, 1, volume);
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `${project?.title.toLowerCase().replace(/\s+/g, "_") || "vidren_video"}.webm`;
      a.click();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const currentSceneInfo = getCurrentSceneAndTimestamp(currentTime);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ background: "#09090B" }}
      >
        {/* Live 60 FPS HTML5 Canvas Viewport */}
        {/* Zoom Controls Overlay (Top-Right) */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, Math.round((z - 0.25) * 100) / 100))}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-indigo-300 px-1 min-w-[36px] text-center font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100))}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomLevel !== 1.0 && (
            <button
              onClick={() => setZoomLevel(1.0)}
              className="p-1 rounded hover:bg-indigo-500/20 text-indigo-400 hover:text-white transition-colors ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-full h-full overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full aspect-video block transition-transform duration-200 ease-out origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>

        {/* Big Center Play Overlay Button */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-20 bg-black/30 backdrop-blur-[2px]"
            onClick={togglePlay}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105"
              style={{
                background: "var(--accent-gradient)",
                boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)",
              }}
            >
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Controls Bar */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-3 z-30"
          style={{
            background: "linear-gradient(transparent, rgba(9, 9, 11, 0.95))",
          }}
        >
          {/* Progress Timeline Slider */}
          <div className="relative group mb-3">
            <div
              className="h-1.5 rounded-full overflow-hidden cursor-pointer"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  background: "var(--accent-gradient)",
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={totalDuration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ height: "16px", top: "-6px" }}
            />

            {/* Scene Markers on Timeline */}
            {narrationSegments.map((seg, i) => {
              const pos = totalDuration > 0 ? (seg.startTime / totalDuration) * 100 : 0;
              return (
                <div
                  key={i}
                  className="absolute top-0 w-0.5 h-1.5"
                  style={{
                    left: `${pos}%`,
                    background: "rgba(255,255,255,0.4)",
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-indigo-400 transition-colors p-1"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
              </button>

              <span className="text-[11px] font-mono text-white/70">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>

              {/* Soundbar / Volume Slider */}
              <div className="flex items-center gap-2 border-l border-white/10 pl-3 ml-1">
                <button
                  onClick={() => {
                    initSpeechSynthesis();
                    setIsMuted((p) => !p);
                  }}
                  className="text-indigo-400 hover:text-white transition-colors"
                  title={isMuted ? "Unmute Voice" : "Mute Voice"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    initSpeechSynthesis();
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (v > 0 && isMuted) setIsMuted(false);
                  }}
                  className="w-20 accent-indigo-500 h-1 rounded bg-white/20 cursor-pointer"
                  title={`Voice Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
                <span className="text-[10px] font-mono text-text-tertiary w-7">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              <button
                onClick={handleTestSound}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-[11px] font-medium text-indigo-300 transition-all"
                title="Click to test AI voice sound output on your speakers"
              >
                <Volume className="w-3 h-3 text-indigo-400" />
                <span>Test Audio</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-indigo-300">
                SCENE {currentSceneInfo.sceneIndex + 1}/{scenesList.length}
              </span>

              <button
                onClick={toggleFullscreen}
                className="text-white/50 hover:text-white transition-colors p-1"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        {videoUrl && (
          <button onClick={handleDownload} className="btn-primary px-5 py-2.5 text-[13px]">
            <Download className="w-3.5 h-3.5" />
            Download WebM Video
          </button>
        )}
        {onRegenerate && (
          <button onClick={onRegenerate} className="btn-secondary px-5 py-2.5 text-[13px]">
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate Video
          </button>
        )}
        {onNewPrompt && (
          <button onClick={onNewPrompt} className="btn-secondary px-5 py-2.5 text-[13px]">
            New Prompt
          </button>
        )}
      </div>
    </motion.div>
  );
};
