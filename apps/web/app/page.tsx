"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppView, VideoProject } from "@/types";

const LandingPage = dynamic(
  () => import("@/components/LandingPage").then((mod) => mod.LandingPage),
  { ssr: false }
);

const VideoGenerator = dynamic(
  () => import("@/components/VideoGenerator").then((mod) => mod.VideoGenerator),
  { ssr: false }
);

const WhiteboardStudio = dynamic(
  () => import("@/components/WhiteboardStudio").then((mod) => mod.WhiteboardStudio),
  { ssr: false }
);

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("VidRen AI ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center text-white px-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
            <span className="text-xl">✨</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">VidRen AI Studio</h2>
          <p className="text-xs text-zinc-400 mb-6 text-center max-w-sm">
            A temporary render state occurred. Click below to continue.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-lg shadow-indigo-600/20"
          >
            Reload Studio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<AppView>("landing");
  const [activeProject, setActiveProject] = useState<VideoProject | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 animate-pulse" />
          <span className="text-sm font-semibold tracking-tight font-mono">Loading VidRen AI...</span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {viewMode === "generator" ? (
        <VideoGenerator
          onBackToLanding={() => setViewMode("landing")}
          onOpenStudio={(proj) => {
            if (proj) setActiveProject(proj);
            setViewMode("studio");
          }}
        />
      ) : viewMode === "studio" ? (
        <WhiteboardStudio
          initialProject={activeProject}
          onBackToGenerator={() => setViewMode("generator")}
        />
      ) : (
        <LandingPage
          onLaunchStudio={() => setViewMode("generator")}
        />
      )}
    </ErrorBoundary>
  );
}
