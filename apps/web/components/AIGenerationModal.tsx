"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, PenTool, Mic, Video, CheckCircle2 } from "lucide-react";

interface AIGenerationModalProps {
  isOpen: boolean;
  promptText: string;
  onComplete: () => void;
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  promptText,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      icon: <Brain className="w-4 h-4 text-sky-400" />,
      label: "Structuring 3-scene whiteboard outline...",
    },
    {
      icon: <PenTool className="w-4 h-4 text-emerald-400" />,
      label: "Synthesizing vector chalk stroke paths & diagrams...",
    },
    {
      icon: <Mic className="w-4 h-4 text-purple-400" />,
      label: "Generating ElevenLabs AI voiceover narration...",
    },
    {
      icon: <Video className="w-4 h-4 text-cyan-400" />,
      label: "Synchronizing timeline & rendering MP4 preview...",
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    setCurrentStep(0);
    setProgress(15);

    const t1 = setTimeout(() => {
      setCurrentStep(1);
      setProgress(45);
    }, 600);

    const t2 = setTimeout(() => {
      setCurrentStep(2);
      setProgress(75);
    }, 1300);

    const t3 = setTimeout(() => {
      setCurrentStep(3);
      setProgress(95);
    }, 2000);

    const t4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        onComplete();
      }, 400);
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg p-6 rounded-2xl border border-sky-500/30 bg-slate-900/90 shadow-2xl shadow-sky-500/20 relative overflow-hidden"
        >
          {}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

          {}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-cyan-300 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Whiteboard Video Generator
              </h3>
              <p className="text-xs text-sky-400 font-mono truncate max-w-[340px]">
                Topic: "{promptText}"
              </p>
            </div>
          </div>

          {}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Generating AI Video Assets</span>
              <span className="text-sky-400 font-bold">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {}
          <div className="space-y-3">
            {steps.map((step, idx) => {
              const isDone = currentStep > idx || progress === 100;
              const isCurrent = currentStep === idx && progress < 100;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-sky-950/40 border-sky-500/50 shadow-md shadow-sky-500/5"
                      : isDone
                      ? "bg-slate-950/40 border-slate-800 opacity-90"
                      : "bg-slate-950/20 border-slate-900 opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <span className="text-xs font-medium text-slate-200">
                      {step.label}
                    </span>
                  </div>

                  <div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 text-sky-400" />
                      </motion.div>
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-slate-700" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
