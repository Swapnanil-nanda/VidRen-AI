"use client";

import React, { useState } from "react";
import { ScenePlan, RendererType, BoardStyle, SubFrameBeat } from "../types";
import {
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  Film,
  Upload,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScenePanelProps {
  scenes: ScenePlan[];
  activeSceneIndex: number;
  onSceneSelect: (index: number) => void;
  onAddScene: () => void;
  onDeleteScene: (index: number) => void;
  onDuplicateScene: (index: number) => void;
  onUpdateScene: (index: number, updates: Partial<ScenePlan>) => void;
  onGenerateFromPrompt?: (promptText: string) => void;
  isGenerating?: boolean;
  boardStyle?: BoardStyle;
}

const RENDERER_TYPES: { id: RendererType; label: string }[] = [
  { id: "process", label: "Process Flow" },
  { id: "timeline", label: "Timeline Axis" },
  { id: "comparison", label: "Comparison" },
  { id: "architecture", label: "Architecture Stack" },
  { id: "equation", label: "Equation Formula" },
  { id: "chart", label: "Data Chart" },
  { id: "simulation", label: "Physics Sim" },
  { id: "hero3d", label: "3D Hero Model" },
];

const PRESET_WEB_IMAGES = [
  {
    name: "1789 Bastille Storming",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Prise_de_la_Bastille.jpg/1280px-Prise_de_la_Bastille.jpg",
  },
  {
    name: "Tennis Court Oath",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Le_Serment_du_Jeu_de_paume.jpg/1280px-Le_Serment_du_Jeu_de_paume.jpg",
  },
  {
    name: "Declaration of Rights",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Declaration_of_the_Rights_of_Man_and_of_the_Citizen_in_1789.jpg/1024px-Declaration_of_the_Rights_of_Man_and_of_the_Citizen_in_1789.jpg",
  },
  {
    name: "DNA Helix Model",
    url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "AI Neural Network",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "WHO Healthcare Facility",
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
  },
];

export function ScenePanel({
  scenes,
  activeSceneIndex,
  onSceneSelect,
  onAddScene,
  onDeleteScene,
  onDuplicateScene,
  onUpdateScene,
  onGenerateFromPrompt,
  isGenerating = false,
}: ScenePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim() || !onGenerateFromPrompt) return;
    onGenerateFromPrompt(prompt.trim());
    setPrompt("");
  };

  const totalDuration = scenes.reduce((sum, scene) => sum + (scene.duration || 10), 0);

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateScene(index, { customImageUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-[360px] h-full flex flex-col bg-[#0F0F11] border-r border-white/10 text-text-primary select-none">
      {/* Header & Re-prompt Section */}
      <div className="p-4 border-b border-white/10 bg-[#111113] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Storyboard Editor</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {scenes.length} Scenes
          </span>
        </div>

        {onGenerateFromPrompt && (
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Re-prompt storyboard (e.g. Add French Revolution storming scene)..."
              className="w-full h-[60px] bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white placeholder-text-tertiary focus:outline-none transition-all resize-none font-sans leading-relaxed"
              rows={2}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 btn-primary py-2 px-3 text-xs rounded-lg disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{isGenerating ? "Planning Scenes..." : "Generate AI Storyboard"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Editable Scene Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <AnimatePresence initial={false}>
          {scenes.map((scene, index) => {
            const isActive = index === activeSceneIndex;
            const isEditing = editingSceneIndex === index;

            return (
              <motion.div
                key={scene.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onSceneSelect(index)}
                className={`group rounded-xl p-3 border transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold w-5 h-5 rounded flex items-center justify-center ${
                        isActive ? "bg-indigo-500 text-white" : "bg-white/10 text-text-tertiary"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <select
                      value={scene.rendererType || "process"}
                      onChange={(e) =>
                        onUpdateScene(index, { rendererType: e.target.value as RendererType })
                      }
                      className="text-[10px] font-mono uppercase bg-black/40 border border-white/10 text-indigo-300 rounded px-2 py-0.5 focus:outline-none"
                    >
                      {RENDERER_TYPES.map((r) => (
                        <option key={r.id} value={r.id} className="bg-[#111113] text-white">
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSceneIndex(isEditing ? null : index);
                      }}
                      className={`p-1 rounded text-xs transition-colors ${
                        isEditing ? "bg-indigo-500 text-white" : "hover:bg-white/10 text-indigo-300"
                      }`}
                      title="Edit Media & Sub-frames"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateScene(index);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-text-tertiary hover:text-white"
                      title="Duplicate scene"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {scenes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScene(index);
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-text-tertiary hover:text-red-400"
                        title="Delete scene"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Editable Title */}
                <input
                  type="text"
                  value={scene.title}
                  onChange={(e) => onUpdateScene(index, { title: e.target.value })}
                  placeholder="Scene title..."
                  className="w-full bg-transparent font-semibold text-xs text-white border-b border-transparent focus:border-indigo-500 focus:outline-none mb-1.5 py-0.5"
                />

                {/* Editable Narration */}
                <textarea
                  value={scene.narration}
                  onChange={(e) => onUpdateScene(index, { narration: e.target.value })}
                  placeholder="Scene narration script..."
                  rows={2}
                  className="w-full bg-black/30 border border-white/5 focus:border-indigo-500 rounded p-2 text-[11px] text-text-secondary placeholder-text-tertiary focus:outline-none resize-none leading-normal mb-2"
                />

                {/* Custom Image Badge / Indicator */}
                {scene.customImageUrl && (
                  <div className="mb-2 p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={scene.customImageUrl}
                        alt="Scene backdrop"
                        className="w-6 h-6 rounded object-cover border border-white/10 flex-shrink-0"
                      />
                      <span className="text-[10px] text-indigo-200 truncate">
                        Custom Media Attached
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateScene(index, { customImageUrl: undefined });
                      }}
                      className="text-text-tertiary hover:text-red-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Expandable Media / Sub-frame Editor Panel */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 pt-2 border-t border-white/10 space-y-2.5 overflow-hidden"
                    >
                      <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-indigo-400" />
                        <span>Media & Image Source</span>
                      </div>

                      {/* Image URL Input */}
                      <div className="flex items-center gap-1">
                        <input
                          type="url"
                          value={scene.customImageUrl || ""}
                          onChange={(e) =>
                            onUpdateScene(index, { customImageUrl: e.target.value.trim() })
                          }
                          placeholder="Paste web image URL..."
                          className="flex-1 px-2 py-1 rounded bg-black/50 border border-white/10 text-[10px] text-white focus:border-indigo-500 focus:outline-none font-mono"
                        />
                        <label className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-text-secondary hover:text-white" title="Upload local image">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(index, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Web Presets Grid */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-text-tertiary">Web Presets:</span>
                        <div className="grid grid-cols-2 gap-1">
                          {PRESET_WEB_IMAGES.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() =>
                                onUpdateScene(index, { customImageUrl: preset.url })
                              }
                              className={`text-[9px] px-2 py-1 rounded border text-left truncate transition-colors ${
                                scene.customImageUrl === preset.url
                                  ? "bg-indigo-500 text-white border-indigo-400 font-semibold"
                                  : "bg-white/[0.02] border-white/5 text-text-secondary hover:bg-white/10"
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Multi-frame Beats Info */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-text-tertiary">
                        <span>Multi-frame Beats:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newBeats = [
                              ...(scene.subFrameBeats || []),
                              {
                                id: `b-${Date.now()}`,
                                timestamp: 0.5,
                                title: "Beat Keyframe",
                                detail: "Visual update",
                              },
                            ];
                            onUpdateScene(index, { subFrameBeats: newBeats });
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Sub-frame
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card Footer: Duration & Visual Primitives */}
                <div className="flex items-center justify-between text-[10px] text-text-tertiary pt-1.5 mt-1 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span>Duration:</span>
                    <input
                      type="number"
                      min={3}
                      max={30}
                      value={scene.duration || 10}
                      onChange={(e) =>
                        onUpdateScene(index, { duration: Math.max(3, parseInt(e.target.value) || 10) })
                      }
                      className="w-10 bg-black/40 border border-white/10 text-center rounded text-white font-mono"
                    />
                    <span>s</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    <span>{scene.visualPrimitives?.length || 0} Primitives</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-white/10 bg-[#111113] flex items-center justify-between">
        <div className="text-xs font-mono text-text-tertiary">
          Total Duration: <span className="text-white font-bold">{Math.round(totalDuration)}s</span>
        </div>
        <button
          onClick={onAddScene}
          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-lg"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Scene</span>
        </button>
      </div>
    </div>
  );
}
