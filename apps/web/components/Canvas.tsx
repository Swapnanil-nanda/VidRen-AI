"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Point,
  Stroke,
  CanvasElement,
  BoardStyle,
  BOARD_CONFIGS,
  Tool,
  ScenePlan,
} from "../types";
import {
  drawChalkStroke,
  drawHighlighterStroke,
  drawEraserStroke,
  fillBoardBackground,
  drawGrid,
  drawRuledLines,
  renderStrokes,
  uid,
} from "../lib/canvasUtils";
import { createFrameRenderer } from "../lib/sceneRenderer";
import { render3DModel } from "../lib/threeDUtils";

interface CanvasProps {
  scenePlan?: ScenePlan;
  elements?: CanvasElement[];
  onElementsChange?: (elements: CanvasElement[]) => void;
  activeTool?: Tool;
  brushSize?: number;
  activeColor?: string;
  boardStyle?: BoardStyle;
  showGrid?: boolean;
  showRuledLines?: boolean;
  currentTime?: number;
}

interface ActiveStroke {
  id: string;
  tool: "pen" | "highlighter" | "eraser";
  color: string;
  width: number;
  points: Point[];
}

export function Canvas({
  scenePlan,
  elements = [],
  onElementsChange,
  activeTool = "pen",
  brushSize = 4,
  activeColor = "#FFFFFF",
  boardStyle = "blackboard",
  showGrid = false,
  showRuledLines = false,
  currentTime = 0,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<ActiveStroke | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const canvas = canvasRef.current;
        if (canvas) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.scale(dpr, dpr);
          }
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const renderCanvasFrame = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);

      if (scenePlan) {
        const frameRenderer = createFrameRenderer(scenePlan, {
          width,
          height,
          fps: 30,
          style: "modern",
        });
        const duration = scenePlan.duration || 10;
        const sceneTime = currentTime % duration;
        frameRenderer(ctx, sceneTime, duration);
      } else {
        
        fillBoardBackground(ctx, width, height, boardStyle);
        const config = BOARD_CONFIGS[boardStyle];
        if (showGrid) drawGrid(ctx, width, height, 40, config.gridColor);
        if (showRuledLines) drawRuledLines(ctx, width, height, config.gridColor);
      }

      const strokes: Stroke[] = [];
      for (const el of elements) {
        if (el.kind === "stroke") {
          strokes.push(el);
        }
      }
      renderStrokes(ctx, strokes);

      for (const el of elements) {
        if (el.kind === "3d-object") {
          render3DModel(ctx, el, timestamp);
        }
      }

      if (currentStroke && currentStroke.points.length > 1) {
        if (currentStroke.tool === "pen") {
          drawChalkStroke(ctx, currentStroke.points, currentStroke.color, currentStroke.width);
        } else if (currentStroke.tool === "highlighter") {
          drawHighlighterStroke(ctx, currentStroke.points, currentStroke.color, currentStroke.width);
        } else if (currentStroke.tool === "eraser") {
          drawEraserStroke(ctx, currentStroke.points, currentStroke.width);
        }
      }
    },
    [scenePlan, boardStyle, showGrid, showRuledLines, elements, currentStroke, currentTime]
  );

  useEffect(() => {
    let active = true;

    const loop = (timestamp: number) => {
      if (!active) return;
      renderCanvasFrame(timestamp);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [renderCanvasFrame]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure !== undefined ? e.pressure : 0.5,
      timestamp: Date.now(),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drawTools: Tool[] = ["pen", "highlighter", "eraser"];
    if (!drawTools.includes(activeTool)) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const pt = getCoordinates(e);
    const strokeTool: "pen" | "highlighter" | "eraser" =
      activeTool === "eraser" ? "eraser" : activeTool === "highlighter" ? "highlighter" : "pen";

    setCurrentStroke({
      id: uid(),
      tool: strokeTool,
      color: activeColor,
      width: brushSize,
      points: [pt],
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    const pt = getCoordinates(e);
    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, pt],
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDrawing(false);

    if (currentStroke.points.length > 1 && onElementsChange) {
      const newStrokeElement: CanvasElement = {
        kind: "stroke",
        id: currentStroke.id,
        points: currentStroke.points,
        color: currentStroke.color,
        width: currentStroke.width,
        tool: currentStroke.tool,
        opacity: 1,
        timestamp: Date.now(),
      };
      onElementsChange([...elements, newStrokeElement]);
    }
    setCurrentStroke(null);
  };

  const getCursorClass = () => {
    switch (activeTool) {
      case "pen":
        return "cursor-crosshair";
      case "highlighter":
        return "cursor-crosshair";
      case "eraser":
        return "cursor-cell";
      default:
        return "cursor-default";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`touch-none ${getCursorClass()}`}
      />
    </div>
  );
}
