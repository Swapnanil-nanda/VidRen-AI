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

  if (viewMode === "generator") {
    return (
      <VideoGenerator
        onBackToLanding={() => setViewMode("landing")}
        onOpenStudio={(proj) => {
          if (proj) setActiveProject(proj);
          setViewMode("studio");
        }}
      />
    );
  }

  if (viewMode === "studio") {
    return (
      <WhiteboardStudio
        initialProject={activeProject}
        onBackToGenerator={() => setViewMode("generator")}
      />
    );
  }

  return (
    <LandingPage
      onLaunchStudio={() => setViewMode("generator")}
    />
  );
}
