"use client";

import React, { useState } from "react";
import { QuizWidgetElement } from "@vidren/dsl";

export const QuizWidget: React.FC<{ element: QuizWidgetElement }> = ({ element }) => {
  const { question, options, hint } = element;
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const selectedOption = options.find((opt) => opt.id === selectedOptionId);

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-5 my-4 backdrop-blur-md shadow-xl">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-purple-400">
          Concept Verification Quiz
        </span>
        {hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-slate-400 hover:text-purple-300 underline"
          >
            {showHint ? "Hide Hint" : "💡 Need a hint?"}
          </button>
        )}
      </div>

      <h4 className="text-base font-medium text-white mb-4">{question}</h4>

      {showHint && hint && (
        <div className="bg-purple-950/40 border border-purple-500/20 text-purple-200 text-xs p-3 rounded-lg mb-3 italic">
          Hint: {hint}
        </div>
      )}

      <div className="space-y-2.5">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          let buttonStyle = "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-purple-500/50";

          if (isSelected) {
            buttonStyle = option.isCorrect
              ? "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold shadow-lg shadow-emerald-500/20"
              : "bg-rose-950/80 border-rose-500 text-rose-200 font-semibold";
          }

          return (
            <button
              key={option.id}
              onClick={() => setSelectedOptionId(option.id)}
              className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all duration-200 flex items-center justify-between ${buttonStyle}`}
            >
              <span>{option.text}</span>
              {isSelected && (
                <span className="text-xs px-2 py-0.5 rounded font-bold">
                  {option.isCorrect ? "✓ Correct" : "✕ Incorrect"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <div
          className={`mt-4 p-3.5 rounded-lg text-xs leading-relaxed ${
            selectedOption.isCorrect
              ? "bg-emerald-950/50 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/50 border border-rose-500/30 text-rose-300"
          }`}
        >
          <strong>{selectedOption.isCorrect ? "Great job! " : "Not quite. "}</strong>
          {selectedOption.explanation || (selectedOption.isCorrect ? "Your selection is accurate." : "Try reviewing the mathematical formulation above.")}
        </div>
      )}
    </div>
  );
};
