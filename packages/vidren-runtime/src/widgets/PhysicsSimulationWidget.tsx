"use client";

import React, { useEffect, useRef, useState } from "react";
import { PhysicsSimulationElement } from "@vidren/dsl";

export const PhysicsSimulationWidget: React.FC<{ element: PhysicsSimulationElement }> = ({ element }) => {
  const { title, simType, initialParams } = element;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [length, setLength] = useState(initialParams.length || 120);
  const [gravity, setGravity] = useState(initialParams.gravity || 9.8);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = (initialParams.angle || 45) * (Math.PI / 180);
    let angleVelocity = 0;
    let angleAcceleration = 0;
    let animId: number;

    const originX = canvas.width / 2;
    const originY = 30;

    const renderFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isRunning) {
        // Physics update equation: theta'' = (-g / l) * sin(theta)
        angleAcceleration = ((-1 * (gravity * 0.1)) / (length * 0.1)) * Math.sin(angle);
        angleVelocity += angleAcceleration;
        angleVelocity *= 0.995; // Damping
        angle += angleVelocity;
      }

      const bobX = originX + length * Math.sin(angle);
      const bobY = originY + length * Math.cos(angle);

      // Draw Pivot Mount
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(originX - 15, originY - 10, 30, 8);

      // Draw String
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Bob
      ctx.beginPath();
      ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => cancelAnimationFrame(animId);
  }, [length, gravity, isRunning, initialParams]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 my-4 backdrop-blur-md shadow-xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-slate-200">
          {title || `Interactive ${simType.toUpperCase()} Simulation`}
        </h4>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-sky-400 hover:bg-slate-700"
        >
          {isRunning ? "⏸ Pause" : "▶ Resume"}
        </button>
      </div>

      <div className="bg-black/60 border border-slate-800 rounded-lg p-2 flex justify-center mb-3">
        <canvas ref={canvasRef} width={340} height={200} className="w-full max-w-[340px]" />
      </div>

      <div className="space-y-2 text-xs font-mono">
        <div className="flex justify-between text-slate-300">
          <span>Pendulum Length ({length}px):</span>
          <input
            type="range"
            min={60}
            max={160}
            value={length}
            onChange={(e) => setLength(parseFloat(e.target.value))}
            className="w-1/2 accent-sky-400"
          />
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Gravity (g = {gravity} m/s²):</span>
          <input
            type="range"
            min={1}
            max={25}
            step={0.5}
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-1/2 accent-sky-400"
          />
        </div>
      </div>
    </div>
  );
};
