"use client";

import React, { useState, useEffect } from "react";
import { VidRenDocumentAST, VidRenElementAST } from "@vidren/dsl";
import { TypographyWidget } from "../widgets/TypographyWidget";
import { KaTeXWidget } from "../widgets/KaTeXWidget";
import { MindMapWidget } from "../widgets/MindMapWidget";
import { ChartWidget } from "../widgets/ChartWidget";
import { CodePlaygroundWidget } from "../widgets/CodePlaygroundWidget";
import { QuizWidget } from "../widgets/QuizWidget";
import { PhysicsSimulationWidget } from "../widgets/PhysicsSimulationWidget";
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw, Video } from "lucide-react";

interface VidRenCanvasProps {
  document: VidRenDocumentAST;
  onSceneChange?: (sceneIndex: number) => void;
}

export const VidRenCanvas: React.FC<VidRenCanvasProps> = ({ document, onSceneChange }) => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentScene = document.scenes[activeSceneIndex] || document.scenes[0];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 2 * playbackSpeed;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const handleSceneSelect = (idx: number) => {
    setActiveSceneIndex(idx);
    setProgress(0);
    if (onSceneChange) onSceneChange(idx);
  };

  const renderElement = (element: VidRenElementAST) => {
    switch (element.type) {
      case "typography":
        return <TypographyWidget key={element.id} element={element} />;
      case "katex":
        return <KaTeXWidget key={element.id} element={element} />;
      case "mindmap":
        return <MindMapWidget key={element.id} element={element} />;
      case "chart":
        return <ChartWidget key={element.id} element={element} />;
      case "code-playground":
        return <CodePlaygroundWidget key={element.id} element={element} />;
      case "quiz":
        return <QuizWidget key={element.id} element={element} />;
      case "physics-simulation":
        return <PhysicsSimulationWidget key={element.id} element={element} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white overflow-hidden relative">
      {/* Background Chalkboard Grid Gridlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Interactive Scene & Video Control Header Bar */}
      <header className="relative z-10 bg-slate-900/90 border-b border-slate-800 backdrop-blur-xl px-5 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950 text-xs shadow-lg shadow-sky-500/20">
            <Video className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide truncate max-w-[240px]">{document.metadata.title}</h2>
            <div className="text-[10px] text-slate-400">VidRen Video Player • Scene {activeSceneIndex + 1} of {document.scenes.length}</div>
          </div>
        </div>

        {/* Video Player Controls (Play/Pause, Progress Scrubber, Speed, Audio, Export) */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-sky-500/20"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />}
          </button>

          <button
            onClick={() => setProgress(0)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Timeline Scrubber */}
          <div className="flex items-center gap-2 w-32 sm:w-48">
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
              {Math.floor((progress / 100) * 60)}s
            </span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-sky-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
          >
            <option value={1}>1.0x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2.0x</option>
          </select>

          <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-200 flex items-center gap-1 transition-all">
            <Download className="w-3 h-3 text-emerald-400" /> MP4
          </button>
        </div>

        {/* Scene Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {document.scenes.map((scene, idx) => (
            <button
              key={scene.sceneId}
              onClick={() => handleSceneSelect(idx)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                activeSceneIndex === idx
                  ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Scene {idx + 1}
            </button>
          ))}
        </div>

      </header>

      {/* Main Interactive Work Area */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full">
        {currentScene ? (
          <div className="space-y-4">
            <div className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{currentScene.title}</h1>
                {currentScene.description && (
                  <p className="text-xs text-slate-400 mt-1">{currentScene.description}</p>
                )}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded">
                Live Interactive Video Scene
              </span>
            </div>

            {currentScene.elements.map(renderElement)}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">No scenes loaded in AST document.</div>
        )}
      </main>
    </div>
  );
};
