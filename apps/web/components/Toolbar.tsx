"use client";

import React from "react";
import {
  Pen,
  Highlighter,
  Eraser,
  Type,
  Square,
  StickyNote,
  Image as ImageIcon,
  MousePointer,
  Download,
  Undo2,
  Redo2,
  Grid3X3,
  AlignLeft,
  Mic,
  Ratio,
  Box
} from "lucide-react";
import {
  Tool,
  BoardStyle,
  ShapeType,
  AspectRatio,
  VoiceOption,
  BOARD_CONFIGS,
  CHALK_COLORS
} from "../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  boardStyle: BoardStyle;
  onBoardStyleChange: (style: BoardStyle) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showRuledLines: boolean;
  onToggleRuledLines: () => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  voiceover: VoiceOption;
  onVoiceoverChange: (voice: VoiceOption) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  activeColor,
  onColorChange,
  boardStyle,
  onBoardStyleChange,
  showGrid,
  onToggleGrid,
  showRuledLines,
  onToggleRuledLines,
  aspectRatio,
  onAspectRatioChange,
  voiceover,
  onVoiceoverChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport
}) => {
  const tools = [
    { id: "select" as Tool, icon: MousePointer, title: "Select" },
    { id: "pen" as Tool, icon: Pen, title: "Pen" },
    { id: "highlighter" as Tool, icon: Highlighter, title: "Highlighter" },
    { id: "eraser" as Tool, icon: Eraser, title: "Eraser" },
    { id: "text" as Tool, icon: Type, title: "Text" },
    { id: "shape" as Tool, icon: Square, title: "Shape" },
    { id: "3d" as Tool, icon: Box, title: "3D Model Visualizer" },
    { id: "image" as Tool, icon: ImageIcon, title: "Image" }
  ];

  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-slate-800/80 bg-slate-900/95 px-3 backdrop-blur-xl shrink-0 select-none z-50">
      <div className="flex items-center gap-1.5 h-full overflow-x-auto no-scrollbar py-2">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-cyan-300 shadow-inner text-slate-950 font-bold">
            <span className="text-sm">✍</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white hidden sm:block font-mono">
            chalk<span className="text-sky-400">.studio</span>
          </span>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Board Style */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950/50 p-0.5 rounded-lg border border-slate-800/50">
          {(["blackboard", "greenboard", "whiteboard"] as BoardStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => onBoardStyleChange(style)}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-md transition-all",
                boardStyle === style
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              )}
            >
              {style.charAt(0).toUpperCase() + style.slice(1).replace("board", "")}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          {tools.map(({ id, icon: Icon, title }) => (
            <button
              key={id}
              onClick={() => onToolChange(id)}
              title={title}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                activeTool === id
                  ? "bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/50"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-800" />

        {/* Brush Size */}
        <div className="hidden md:flex items-center gap-2 px-1">
          <div className="w-4 flex justify-center">
            <div
              className="rounded-full bg-slate-400"
              style={{ width: Math.max(2, brushSize / 2), height: Math.max(2, brushSize / 2) }}
            />
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        <div className="h-5 w-px bg-slate-800 hidden md:block" />

        {/* Color Palette */}
        <div className="hidden lg:flex items-center gap-1">
          {CHALK_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={cn(
                "h-5 w-5 rounded-full transition-transform hover:scale-110",
                activeColor === color ? "ring-2 ring-white scale-110" : "opacity-80"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-800" />

        {/* View Toggles */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onToggleGrid}
            title="Toggle Grid"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              showGrid ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleRuledLines}
            title="Toggle Ruled Lines"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
              showRuledLines ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <AlignLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden md:block" />

        {/* Voiceover Selector */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-slate-950/50 rounded-lg border border-slate-800/50 text-xs">
          <Mic className="h-3.5 w-3.5 text-purple-400" />
          <select
            value={voiceover}
            onChange={(e) => onVoiceoverChange(e.target.value as VoiceOption)}
            className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
          >
            <option value="alloy" className="bg-slate-900">Alloy (Warm)</option>
            <option value="echo" className="bg-slate-900">Echo (Deep)</option>
            <option value="fable" className="bg-slate-900">Fable (British)</option>
            <option value="nova" className="bg-slate-900">Nova (Energetic)</option>
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 px-3 py-1.5 text-xs font-bold text-slate-950 transition-all shadow-md shadow-sky-500/20"
        >
          <Download className="h-3.5 w-3.5 text-slate-950" />
          <span>Export Final MP4</span>
        </button>
      </div>
    </div>
  );
};
