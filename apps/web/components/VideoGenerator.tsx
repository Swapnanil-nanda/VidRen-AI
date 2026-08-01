"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Settings,
  ArrowLeft,
  Layout,
  RefreshCw,
  Film,
  Zap,
  Volume2,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { planVideoProject } from "../lib/aiPlanner";
import { getApiKey } from "../lib/geminiClient";
import { composeVideo, NarrationSegment } from "../lib/videoCompositor";
import { stopNarration } from "../lib/speechSynthesis";
import { GenerationProgress } from "./GenerationProgress";
import { VideoPlayer } from "./VideoPlayer";
import {
  PipelineState,
  GeneratorSettings,
  DEFAULT_GENERATOR_SETTINGS,
  VIDEO_RESOLUTIONS,
  DURATION_CONFIGS,
  VideoProject,
} from "../types";

interface VideoGeneratorProps {
  onBackToLanding: () => void;
  onOpenStudio: (project?: VideoProject) => void;
}

const EXAMPLE_PROMPTS = [
  "Timeline and key events of the French Revolution (1789-1799)",
  "WHO & NFHS-5/6 National Family Health Survey indicators",
  "How backpropagation optimizes weights in deep neural networks",
  "Explain quantum entanglement and superdense coding",
  "How DNA replication works step-by-step",
];

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  onBackToLanding,
  onOpenStudio,
}) => {
  const [prompt, setPrompt] = useState("");
  const [settings, setSettings] = useState<GeneratorSettings>(DEFAULT_GENERATOR_SETTINGS);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [fps, setFps] = useState(30);
  const [quality, setQuality] = useState("Standard");

  const [pipelineState, setPipelineState] = useState<PipelineState>({
    stage: "idle",
    progress: 0,
    currentScene: 0,
    totalScenes: 0,
    message: "",
  });

  const [plannedProject, setPlannedProject] = useState<VideoProject | null>(null);
  const [videoResult, setVideoResult] = useState<{
    url: string;
    duration: number;
    narrationSegments: NarrationSegment[];
  } | null>(null);

  useEffect(() => {
    const envGemini = getApiKey();
    const envGroq = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    setSettings((prev) => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        gemini: envGemini || undefined,
        groq: envGroq || undefined,
      },
    }));
  }, []);

  const activeApiKey = settings.apiKeys.groq || process.env.NEXT_PUBLIC_GROQ_API_KEY || settings.apiKeys.gemini || getApiKey() || "";
  const activeProviderName = (settings.apiKeys.groq || process.env.NEXT_PUBLIC_GROQ_API_KEY) ? "Groq Llama 3.3 70B (⚡ 500 T/s)" : activeApiKey ? "Gemini 2.0 Flash" : "Procedural Mode";

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setVideoResult(null);
    setPlannedProject(null);
    setPipelineState({
      stage: "classifying",
      progress: 10,
      currentScene: 0,
      totalScenes: 0,
      message: "Classifying topic domain and mapping knowledge structure...",
    });

    try {
      // Stage 1: AI Planning & Schema Validation
      await new Promise((r) => setTimeout(r, 400));
      setPipelineState({
        stage: "planning",
        progress: 30,
        currentScene: 0,
        totalScenes: 0,
        message: "AI Planner is composing topic-aware ScenePlans and visual primitives...",
      });

      const project = await planVideoProject(prompt, {
        apiKey: activeApiKey,
        targetDuration: settings.targetDuration,
      });

      setPlannedProject(project);

      // Stage 2: Frame Rendering & Video Compositing
      setPipelineState({
        stage: "rendering",
        progress: 60,
        currentScene: 1,
        totalScenes: project.scenes.length,
        message: `Rendering ${project.scenes.length} topic-aware motion graphics scenes...`,
      });

      const resConfig = VIDEO_RESOLUTIONS[settings.resolution];
      const compositorResult = await composeVideo(
        {
          width: resConfig.width,
          height: resConfig.height,
          fps: 20,
          scenes: project.scenes,
          style: settings.videoStyle,
          voiceOption: settings.voiceOption,
          apiKey: activeApiKey || undefined,
        },
        (progressInfo) => {
          setPipelineState({
            stage: progressInfo.stage === "compositing" ? "compositing" : "rendering",
            progress: 60 + Math.round(progressInfo.progress * 0.35),
            currentScene: progressInfo.currentScene,
            totalScenes: progressInfo.totalScenes,
            message: progressInfo.message,
          });
        }
      );

      setPipelineState({
        stage: "complete",
        progress: 100,
        currentScene: project.scenes.length,
        totalScenes: project.scenes.length,
        message: "Video generation complete!",
      });

      setVideoResult({
        url: compositorResult.videoUrl,
        duration: compositorResult.videoDuration,
        narrationSegments: compositorResult.narrationSegments,
      });
    } catch (err: any) {
      console.error("Pipeline failure:", err);
      setPipelineState({
        stage: "error",
        progress: 0,
        currentScene: 0,
        totalScenes: 0,
        message: "Generation Error",
        error: err?.message || "An error occurred during AI planning or video rendering.",
      });
    }
  };

  const handleReset = () => {
    stopNarration();
    setPipelineState({
      stage: "idle",
      progress: 0,
      currentScene: 0,
      totalScenes: 0,
      message: "",
    });
    setVideoResult(null);
    setPlannedProject(null);
  };

  const saveSettings = () => {
    setShowSettingsModal(false);
  };

  const isProcessing =
    pipelineState.stage !== "idle" &&
    pipelineState.stage !== "complete" &&
    pipelineState.stage !== "error";

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Header */}
      <header
        className="h-16 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl"
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          background: "rgba(9, 9, 11, 0.8)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToLanding}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-gradient)" }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              VidRen AI
              <span className="text-text-tertiary font-normal text-xs ml-2 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                Prompt-to-Video Engine
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeApiKey ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span className="text-text-secondary font-mono text-[11px]">
              {activeProviderName}
            </span>
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-all"
            title="Pipeline Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenStudio(plannedProject || undefined)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary border border-white/10 hover:border-white/20 transition-all bg-white/[0.03]"
          >
            <Layout className="w-3.5 h-3.5 text-indigo-400" />
            <span>Edit Storyboard</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
        {/* Idle Prompt Input */}
        {pipelineState.stage === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Unified Modular Motion Graphics Pipeline
            </div>

            <h1 className="text-display mb-4 gradient-text-subtle">
              What do you want to teach today?
            </h1>
            <p className="text-body max-w-md mb-8">
              Enter any concept or topic. AI classifies the domain, generates specialized visual renderers, and produces a complete video.
            </p>

            <div
              className="w-full rounded-2xl p-4 transition-all relative overflow-hidden focus-within:border-indigo-500/40 shadow-2xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. How DNA replication works step-by-step or Transformer architecture in AI..."
                rows={4}
                className="w-full bg-transparent text-text-primary text-[15px] placeholder:text-text-tertiary focus:outline-none resize-none leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  }
                }}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06] mt-2">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {(["quick", "standard", "deep_dive"] as const).map((durKey) => {
                    const conf = DURATION_CONFIGS[durKey];
                    const isSelected = settings.targetDuration === durKey;
                    return (
                      <button
                        key={durKey}
                        onClick={() =>
                          setSettings((prev) => ({ ...prev, targetDuration: durKey }))
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm"
                            : "border-white/5 bg-white/[0.02] text-text-tertiary hover:border-white/10 hover:text-text-secondary"
                        }`}
                      >
                        <span>{conf.label}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            isSelected
                              ? "bg-indigo-500/30 text-indigo-200"
                              : "bg-white/5 text-text-tertiary"
                          }`}
                        >
                          {conf.estimatedLength}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="btn-primary text-xs px-5 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                >
                  <span>Generate Video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Example prompts */}
            <div className="w-full mt-8">
              <p className="text-caption text-xs mb-3 text-left">
                Try an example domain:
              </p>
              <div className="flex flex-wrap gap-2 justify-start">
                {EXAMPLE_PROMPTS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="text-left text-xs px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 text-text-secondary transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="w-full py-12 flex flex-col items-center">
            <h2 className="text-title text-xl mb-2 text-center gradient-text">
              Synthesizing Topic Video
            </h2>
            <p className="text-caption text-center max-w-sm mb-10 text-text-tertiary">
              Topic: &quot;{prompt}&quot;
            </p>

            <GenerationProgress
              stage={pipelineState.stage}
              progress={pipelineState.progress}
              currentScene={pipelineState.currentScene}
              totalScenes={pipelineState.totalScenes}
              message={pipelineState.message}
            />
          </div>
        )}

        {/* Video Player Output */}
        {pipelineState.stage === "complete" && videoResult && plannedProject && (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-title text-xl text-white font-semibold">
                  {plannedProject.title}
                </h2>
                <p className="text-caption text-xs mt-1">
                  {plannedProject.scenes.length} Scenes • {Math.round(videoResult.duration)}s Duration • {plannedProject.learningObjective}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenStudio(plannedProject)}
                  className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
                >
                  <Layout className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit Storyboard</span>
                </button>
                <button
                  onClick={handleReset}
                  className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New Video</span>
                </button>
              </div>
            </div>

            <VideoPlayer
              project={plannedProject}
              videoUrl={videoResult.url}
              narrationSegments={videoResult.narrationSegments}
              onRegenerate={handleGenerate}
              onNewPrompt={handleReset}
            />

            {/* Scene Plan Breakdown */}
            <div className="mt-8 pt-8 border-t border-white/[0.06]">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Generated ScenePlan Breakdown ({plannedProject.scenes.length} Scenes)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plannedProject.scenes.map((sc, i) => (
                  <div
                    key={sc.id || i}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-indigo-400">
                        Scene {sc.sceneNumber} • {sc.duration}s
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {sc.rendererType}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white mb-1">
                      {sc.title}
                    </h4>
                    <p className="text-[12px] text-text-tertiary line-clamp-2">
                      {sc.narration}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {pipelineState.stage === "error" && (
          <div className="w-full max-w-md p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-title text-white mb-2">AI Plan Error</h3>
            <p className="text-caption text-red-300 text-xs mb-6">
              {pipelineState.error || pipelineState.message}
            </p>
            <button onClick={handleReset} className="btn-primary text-xs px-5 py-2.5">
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl border border-white/10 bg-[#111113] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-title text-base font-semibold text-white">
                    Pipeline Settings
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-text-tertiary hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Export Resolution */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Export Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "720p", label: "720p", desc: "1280×720" },
                    { id: "1080p", label: "1080p", desc: "1920×1080" },
                    { id: "4k", label: "4K", desc: "3840×2160" }
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setSettings((p) => ({ ...p, resolution: res.id as any }))}
                      className={`py-2 px-1 rounded-lg text-xs font-mono border transition-all flex flex-col items-center justify-center gap-1 ${
                        settings.resolution === res.id
                          ? "border-indigo-500 bg-indigo-500/10 text-white font-semibold"
                          : "border-white/5 bg-white/[0.02] text-text-tertiary hover:border-white/10"
                      }`}
                    >
                      <span>{res.label}</span>
                      <span className="text-[10px] opacity-60 font-sans tracking-tight">{res.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Rate (FPS) */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Frame Rate (FPS)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[20, 30, 60].map((val) => (
                    <button
                      key={val}
                      onClick={() => setFps(val)}
                      className={`py-2 rounded-lg text-xs font-mono border transition-all ${
                        fps === val
                          ? "border-indigo-500 bg-indigo-500/10 text-white font-semibold"
                          : "border-white/5 bg-white/[0.02] text-text-tertiary hover:border-white/10"
                      }`}
                    >
                      {val} FPS
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Quality */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Video Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1em'
                  }}
                >
                  {["Standard", "High", "Ultra"].map((q) => (
                    <option key={q} value={q} className="bg-[#111113] text-white">
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="btn-primary text-xs px-4 py-2"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
