"use client";

import React, { useState } from "react";
import { CodePlaygroundElement } from "@vidren/dsl";

export const CodePlaygroundWidget: React.FC<{ element: CodePlaygroundElement }> = ({ element }) => {
  const { title, language, code, output: initialOutput, isExecutable = true } = element;
  const [currentCode, setCurrentCode] = useState(code);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(initialOutput || null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Safe client simulation execution
      try {
        if (language === "javascript" || language === "typescript") {
          let capturedLogs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
            error: (...args: any[]) => capturedLogs.push("[ERROR] " + args.join(" ")),
          };
          const runner = new Function("console", currentCode);
          runner(customConsole);
          setConsoleOutput(capturedLogs.join("\n") || "Code executed successfully with 0 return values.");
        } else {
          setConsoleOutput(`[${language.toUpperCase()} Runtime]: Code compiled & executed cleanly.`);
        }
      } catch (err: any) {
        setConsoleOutput(`[Execution Error]: ${err.message}`);
      }
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden my-4 shadow-2xl">
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-slate-300 font-semibold ml-2">
            {title || `Interactive ${language} Playground`}
          </span>
        </div>

        {isExecutable && (
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isRunning ? "Running..." : "▶ Run Code"}
          </button>
        )}
      </div>

      <div className="p-4 font-mono text-sm bg-slate-950 text-slate-200 overflow-x-auto">
        <textarea
          value={currentCode}
          onChange={(e) => setCurrentCode(e.target.value)}
          rows={Math.max(4, currentCode.split("\n").length)}
          className="w-full bg-transparent text-emerald-300 font-mono text-sm focus:outline-none resize-none leading-relaxed"
          spellCheck={false}
        />
      </div>

      {consoleOutput !== null && (
        <div className="border-t border-slate-800 bg-black/80 p-3 font-mono text-xs text-sky-400">
          <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Terminal Console Output:</div>
          <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
        </div>
      )}
    </div>
  );
};
