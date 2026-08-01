"use client";

import React, { useState } from "react";
import { InteractiveChartElement } from "@vidren/dsl";

export const ChartWidget: React.FC<{ element: InteractiveChartElement }> = ({ element }) => {
  const { title, chartType, data, controls } = element;

  // Track control values
  const [controlState, setControlState] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (controls) {
      controls.forEach((c) => {
        initial[c.name] = c.defaultValue;
      });
    }
    return initial;
  });

  const handleControlChange = (name: string, val: number) => {
    setControlState((prev) => ({ ...prev, [name]: val }));
  };

  // Compute dynamic scalar multiplier if controls exist
  const scalar = Object.values(controlState).reduce((acc, curr) => acc * curr, 1) || 1;

  const maxValue = Math.max(...data.map((d) => d.value * scalar), 1);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 my-4 backdrop-blur-md shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-slate-200">{title || "Interactive Data Chart"}</h4>
        <span className="text-xs px-2.5 py-1 rounded-full bg-sky-950 border border-sky-500/30 text-sky-300 font-mono">
          {chartType}
        </span>
      </div>

      {/* SVG Bar Chart Simulation */}
      <div className="h-48 flex items-end justify-around gap-2 pt-6 pb-2 border-b border-slate-800">
        {data.map((dp, idx) => {
          const scaledVal = dp.value * scalar;
          const heightPercent = Math.min(100, Math.max(10, (scaledVal / maxValue) * 100));

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <span className="text-xs text-sky-400 font-mono font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                {scaledVal.toFixed(1)}
              </span>
              <div
                className="w-full bg-gradient-to-t from-sky-600 to-cyan-400 rounded-t-md transition-all duration-300 group-hover:from-sky-500 group-hover:to-cyan-300 shadow-lg shadow-sky-500/20"
                style={{ height: `${heightPercent}%` }}
              />
              <span className="text-xs text-slate-400 font-medium truncate w-full text-center mt-1">
                {dp.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Interactive Controls */}
      {controls && controls.length > 0 && (
        <div className="mt-4 pt-3 space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Interactive Dynamic Controls:
          </div>
          {controls.map((ctrl) => (
            <div key={ctrl.name} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>{ctrl.label}:</span>
                <span className="text-cyan-400 font-bold">{controlState[ctrl.name]}</span>
              </div>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step || 0.1}
                value={controlState[ctrl.name]}
                onChange={(e) => handleControlChange(ctrl.name, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
