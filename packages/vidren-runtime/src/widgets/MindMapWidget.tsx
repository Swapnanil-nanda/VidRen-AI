"use client";

import React, { useState } from "react";
import { MindMapElement, MindMapNode } from "@vidren/dsl";

const MindMapTreeNode: React.FC<{ node: MindMapNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-start my-1.5 ml-4 border-l-2 border-slate-700/60 pl-3">
      <div className="flex items-center gap-2">
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-4 h-4 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-xs text-sky-400 font-bold hover:bg-slate-700"
          >
            {expanded ? "−" : "+"}
          </button>
        )}
        <div
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
            depth === 0
              ? "bg-sky-950/80 border-sky-500/50 text-sky-200 shadow-md font-bold text-base"
              : "bg-slate-900/60 border-slate-700 text-slate-200 hover:border-sky-500/40"
          }`}
        >
          {node.label}
          {node.description && (
            <div className="text-xs text-slate-400 font-normal mt-0.5">{node.description}</div>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col mt-1">
          {node.children!.map((child) => (
            <MindMapTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const MindMapWidget: React.FC<{ element: MindMapElement }> = ({ element }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 my-4 backdrop-blur-md shadow-xl overflow-x-auto">
      <div className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-3">
        Knowledge Hierarchy & Mind Map
      </div>
      <MindMapTreeNode node={element.root} />
    </div>
  );
};
