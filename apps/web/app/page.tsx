"use client";

import React, { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { VideoGenerator } from "@/components/VideoGenerator";
import { WhiteboardStudio } from "@/components/WhiteboardStudio";
import { AppView, VideoProject } from "@/types";

export default function Home() {
  const [viewMode, setViewMode] = useState<AppView>("landing");
  const [activeProject, setActiveProject] = useState<VideoProject | undefined>(undefined);

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
