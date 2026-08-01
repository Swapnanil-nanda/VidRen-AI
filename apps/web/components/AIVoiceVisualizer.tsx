"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Mic } from "lucide-react";
import { VoiceOption } from "../types";

interface AIVoiceVisualizerProps {
  isSpeaking: boolean;
  narrationText?: string;
  text?: string;
  voiceover?: VoiceOption;
}

export const AIVoiceVisualizer: React.FC<AIVoiceVisualizerProps> = ({
  isSpeaking,
  narrationText,
  voiceover,
}) => {
  const [bars, setBars] = useState<number[]>([40, 70, 30, 90, 60, 80, 50, 95, 45, 65]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking) {
      interval = setInterval(() => {
        setBars(Array.from({ length: 12 }, () => Math.floor(Math.random() * 70) + 25));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  if (!isSpeaking) return null;

  return (
    <div className="absolute top-4 right-4 z-40 flex items-center gap-3 bg-slate-900/90 border border-sky-500/40 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xl shadow-sky-500/10 pointer-events-none select-none">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-400">
          <Mic className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
            AI Voiceover ({voiceover})
          </span>
          <span className="text-[9px] font-mono text-slate-400 max-w-[180px] truncate">
            {narrationText}
          </span>
        </div>
      </div>

      {/* Soundwave Equalizer Bars */}
      <div className="flex items-end gap-1 h-5 px-1 border-l border-slate-800">
        {bars.map((height, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-sky-500 to-cyan-300 rounded-full"
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};
