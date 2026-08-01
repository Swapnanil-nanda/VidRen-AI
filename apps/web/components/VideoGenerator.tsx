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
  MessageSquare,
  User,
  Plus,
} from "lucide-react";
import { planVideoProject } from "../lib/aiPlanner";
import { getApiKey } from "../lib/geminiClient";
import { composeVideo, NarrationSegment } from "../lib/videoCompositor";
import { stopNarration } from "../lib/speechSynthesis";
import { GenerationProgress } from "./GenerationProgress";
import { VideoPlayer } from "./VideoPlayer";
import { AuthModal } from "./AuthModal";
import { ChatHistorySidebar, SavedChatThread } from "./ChatHistorySidebar";
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

const LOCAL_STORAGE_KEY = "vidren_saved_chat_threads";

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({
  onBackToLanding,
  onOpenStudio,
}) => {
  const [prompt, setPrompt] = useState("");
  const [settings, setSettings] = useState<GeneratorSettings>(DEFAULT_GENERATOR_SETTINGS);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

  const [savedThreads, setSavedThreads] = useState<SavedChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(undefined);

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
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedThreads(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load saved chat threads from local storage:", e);
    }
  }, []);

  const saveThreadToHistory = (proj: VideoProject) => {
    const newThread: SavedChatThread = {
      id: proj.id,
      title: proj.title || "Untitled Video Project",
      prompt: proj.prompt,
      sceneCount: proj.scenes.length,
      updatedAt: new Date().toISOString(),
      project: proj,
    };

    setSavedThreads((prev) => {
      const filtered = prev.filter((t) => t.id !== proj.id);
      const updated = [newThread, ...filtered];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save thread:", e);
      }
      return updated;
    });
    setActiveThreadId(proj.id);
  };

  const handleDeleteThread = (id: string) => {
    setSavedThreads((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to delete thread:", e);
      }
      return updated;
    });
    if (activeThreadId === id) {
      setActiveThreadId(undefined);
    }
  };

  const handleSelectThread = (thread: SavedChatThread) => {
    setPrompt(thread.prompt);
    setPlannedProject(thread.project);
    setActiveThreadId(thread.id);
    setPipelineState({
      stage: "complete",
      progress: 100,
      currentScene: thread.project.scenes.length,
      totalScenes: thread.project.scenes.length,
      message: "Loaded saved video thread",
    });
  };

  const handleStartNewChat = () => {
    setPrompt("");
    setPlannedProject(null);
    setVideoResult(null);
    setActiveThreadId(undefined);
    setPipelineState({
      stage: "idle",
      progress: 0,
      currentScene: 0,
      totalScenes: 0,
      message: "",
    });
  };

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setPipelineState({
      stage: "analyzing",
      progress: 5,
      currentScene: 0,
      totalScenes: 0,
      message: "Analyzing topic & curriculum requirements...",
    });

    try {
      const project = await planVideoProject(prompt, {
        apiKey: settings.apiKeys.gemini || settings.apiKeys.groq,
        targetDuration: settings.targetDuration,
      });

      setPlannedProject(project);
      saveThreadToHistory(project);

      setPipelineState({
        stage: "rendering",
        progress: 40,
        currentScene: 1,
        totalScenes: project.scenes.length,
        message: "Rendering motion graphic visual frames...",
      });

      const res = await composeVideo(
        {
          width: VIDEO_RESOLUTIONS[settings.resolution].width,
          height: VIDEO_RESOLUTIONS[settings.resolution].height,
          fps,
          scenes: project.scenes,
          style: settings.videoStyle,
          voiceOption: settings.voiceOption,
        },
        (progress) => {
          setPipelineState({
            stage: progress.stage === "complete" ? "complete" : "rendering",
            progress: Math.min(95, 40 + Math.round((progress.progress * 55) / 100)),
            currentScene: progress.currentScene,
            totalScenes: progress.totalScenes,
            message: progress.message,
          });
        }
      );

      setVideoResult({
        url: res.videoUrl,
        duration: res.videoDuration,
        narrationSegments: project.scenes.map((s, idx) => ({
          text: s.narration,
          startTime: idx * 10,
          duration: s.duration || 10,
        })),
      });

      setPipelineState({
        stage: "complete",
        progress: 100,
        currentScene: project.scenes.length,
        totalScenes: project.scenes.length,
        message: "Video generated successfully!",
      });
    } catch (err: any) {
      console.error("Pipeline failure:", err);
      setPipelineState({
        stage: "error",
        progress: 0,
        currentScene: 0,
        totalScenes: 0,
        message: "Generation failed",
        error: err.message || "An unexpected error occurred",
      });
    }
  };

  const saveSettings = () => {
    setShowSettingsModal(false);
  };

  const activeApiKey = settings.apiKeys.gemini || settings.apiKeys.groq;
  const activeProviderName = settings.apiKeys.groq
    ? "Groq Llama 3"
    : settings.apiKeys.gemini
    ? "Gemini 2.0 Flash"
    : "Procedural Engine";

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col relative overflow-x-hidden">
      {/* Header Bar with Back Button & Chat History Button */}
      <header
        className="h-16 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl"
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          background: "rgba(9, 9, 11, 0.8)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Prominent Back Option */}
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-white hover:bg-white/10 transition-all border border-white/10 bg-white/[0.04]"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span>Back</span>
          </button>

          {/* Chat History Sidebar Toggle */}
          <button
            onClick={() => setShowHistorySidebar(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-white hover:bg-white/10 transition-all border border-white/10 bg-white/[0.04]"
            title="Open Chat History Threads"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Saved Chats</span>
            {savedThreads.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-mono">
                {savedThreads.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 ml-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-gradient)" }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight hidden md:inline">
              VidRen AI
              <span className="text-text-tertiary font-normal text-xs ml-2 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                Video Chat Studio
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03]">
              <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" />
              <span className="text-xs font-medium text-white max-w-[100px] truncate">
                {user.name}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-white border border-white/10 bg-white/[0.03] transition-all"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sign in</span>
            </button>
          )}

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

      {/* Main Body Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
        {pipelineState.stage === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Unified Motion Graphics Video AI Engine
            </div>

            <h1 className="text-display mb-4 gradient-text-subtle">
              What do you want to teach today?
            </h1>
            <p className="text-body max-w-md mb-8">
              Describe your topic or curriculum, and VidRen AI will generate a complete video lesson with continuous narration.
            </p>

            {/* Prompt Box Input */}
            <div className="w-full max-w-2xl bg-[#111113] p-2.5 rounded-2xl border border-white/10 shadow-2xl focus-within:border-indigo-500/60 transition-all mb-8">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. WHO & NFHS National Family Health Survey indicators..."
                rows={3}
                className="w-full bg-transparent p-3 text-sm text-white placeholder-text-tertiary focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between pt-2 border-t border-white/5 px-2">
                <div className="flex items-center gap-2">
                  <select
                    value={settings.targetDuration}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, targetDuration: e.target.value as any }))
                    }
                    className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-text-secondary focus:outline-none"
                  >
                    <option value="quick">Quick (5 scenes)</option>
                    <option value="standard">Standard (12 scenes)</option>
                    <option value="deep_dive">Deep Dive (25 scenes)</option>
                  </select>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
                >
                  <span>Generate Video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sample Prompts */}
            <div className="w-full max-w-2xl text-left">
              <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider block mb-3">
                Try Example Prompts:
              </span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-text-secondary hover:text-white transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {pipelineState.stage !== "idle" && pipelineState.stage !== "complete" && pipelineState.stage !== "error" && (
          <div className="w-full max-w-xl py-12">
            <GenerationProgress
              stage={pipelineState.stage}
              progress={pipelineState.progress}
              currentScene={pipelineState.currentScene}
              totalScenes={pipelineState.totalScenes}
              message={pipelineState.message}
            />
          </div>
        )}

        {pipelineState.stage === "complete" && plannedProject && (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-title text-xl text-white font-semibold">
                  {plannedProject.title}
                </h2>
                <p className="text-body text-xs mt-1">
                  {plannedProject.scenes.length} scenes · Continuous Master Script Narration
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartNewChat}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Video Chat
                </button>
                <button
                  onClick={() => onOpenStudio(plannedProject)}
                  className="btn-primary text-xs px-4 py-2"
                >
                  <Layout className="w-3.5 h-3.5" />
                  Edit Storyboard
                </button>
              </div>
            </div>

            <VideoPlayer
              project={plannedProject}
              scenes={plannedProject.scenes}
              videoUrl={videoResult?.url}
              narrationSegments={videoResult?.narrationSegments || []}
              onRegenerate={handleGenerate}
              onNewPrompt={handleStartNewChat}
            />
          </div>
        )}

        {pipelineState.stage === "error" && (
          <div className="w-full max-w-md p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-title text-base font-semibold text-white mb-2">
              Generation Error
            </h3>
            <p className="text-body text-xs text-red-300 mb-6">
              {pipelineState.error}
            </p>
            <button onClick={handleGenerate} className="btn-primary text-xs px-5 py-2.5 mx-auto">
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Generation
            </button>
          </div>
        )}
      </main>

      {/* Modals & Sidebar Drawers */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      <ChatHistorySidebar
        isOpen={showHistorySidebar}
        onClose={() => setShowHistorySidebar(false)}
        savedThreads={savedThreads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleStartNewChat}
        onDeleteThread={handleDeleteThread}
      />
    </div>
  );
};
