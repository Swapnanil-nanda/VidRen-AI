"use client";

import React, { useState } from "react";
import { KaTeXMathElement } from "@vidren/dsl";

export const KaTeXWidget: React.FC<{ element: KaTeXMathElement }> = ({ element }) => {
  const { expression, explanation, variables } = element;

  // Track dynamic variable values
  const [varValues, setVarValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (variables) {
      Object.entries(variables).forEach(([key, conf]) => {
        initial[key] = conf.default;
      });
    }
    return initial;
  });

  const handleSliderChange = (varKey: string, val: number) => {
    setVarValues((prev) => ({ ...prev, [varKey]: val }));
  };

  // Replace variable tokens in formula with current live values
  let evaluatedExpression = expression;
  Object.entries(varValues).forEach(([key, val]) => {
    evaluatedExpression = evaluatedExpression.replace(new RegExp(`\\b${key}\\b`, "g"), val.toString());
  });

  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-5 my-4 backdrop-blur-md shadow-xl">
      <div className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">
        Mathematical Formulation
      </div>

      <div className="bg-black/50 border border-sky-500/20 rounded-lg p-4 my-2 text-center overflow-x-auto">
        <code className="text-xl text-emerald-400 font-mono tracking-wide">
          {evaluatedExpression}
        </code>
      </div>

      {explanation && (
        <p className="text-xs text-slate-400 mt-2 italic">{explanation}</p>
      )}

      {variables && Object.keys(variables).length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
          <div className="text-xs font-medium text-slate-300">Interactive Variables:</div>
          {Object.entries(variables).map(([key, conf]) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>{conf.label} ({key}):</span>
                <span className="text-sky-400 font-bold">{varValues[key]}</span>
              </div>
              <input
                type="range"
                min={conf.min}
                max={conf.max}
                step={0.1}
                value={varValues[key] ?? conf.default}
                onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
