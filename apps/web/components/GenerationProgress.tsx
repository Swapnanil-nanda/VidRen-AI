"use client";

import React from "react";
import { motion } from "framer-motion";
import type { PipelineStage } from "../types";

interface GenerationProgressProps {
  stage: PipelineStage;
  progress: number;
  currentScene: number;
  totalScenes: number;
  message: string;
}

const STAGES: {
  id: PipelineStage;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "analyzing",
    label: "Analyzing prompt",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    id: "scripting",
    label: "Writing script",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    id: "designing",
    label: "Designing visuals",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    id: "rendering",
    label: "Rendering frames",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    id: "compositing",
    label: "Compositing video",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
];

function getStageIndex(stage: PipelineStage): number {
  const idx = STAGES.findIndex((s) => s.id === stage);
  if (stage === "complete") return STAGES.length;
  return idx;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  stage,
  progress,
  currentScene,
  totalScenes,
  message,
}) => {
  const activeIndex = getStageIndex(stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Steps */}
      <div className="space-y-1">
        {STAGES.map((s, i) => {
          const isComplete = i < activeIndex;
          const isActive = i === activeIndex;
          const isPending = i > activeIndex;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors"
              style={{
                background: isActive
                  ? "rgba(99, 102, 241, 0.06)"
                  : "transparent",
              }}
            >
              {/* Status indicator */}
              <div className="relative flex-shrink-0">
                {isComplete ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(99, 102, 241, 0.15)" }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#6366F1" }}
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                    />
                  </div>
                )}
              </div>

              {/* Icon */}
              <span
                style={{
                  color: isComplete
                    ? "#10B981"
                    : isActive
                    ? "#818CF8"
                    : "var(--text-tertiary)",
                  opacity: isPending ? 0.4 : 1,
                }}
              >
                {s.icon}
              </span>

              {/* Label */}
              <span
                className="text-[13px] font-medium flex-1"
                style={{
                  color: isComplete
                    ? "var(--text-secondary)"
                    : isActive
                    ? "var(--text-primary)"
                    : "var(--text-tertiary)",
                  opacity: isPending ? 0.4 : 1,
                }}
              >
                {s.label}
              </span>

              {/* Progress indicator for active step */}
              {isActive && stage === "rendering" && totalScenes > 0 && (
                <span className="text-[11px] font-mono text-text-tertiary">
                  {currentScene}/{totalScenes}
                </span>
              )}

              {isComplete && (
                <span className="text-[11px] text-emerald-500/60">✓</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="mt-4 px-3">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--accent-gradient)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-[11px] text-text-tertiary mt-2 text-center">
          {message}
        </p>
      </div>
    </motion.div>
  );
};
