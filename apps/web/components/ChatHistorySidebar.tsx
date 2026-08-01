"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Trash2, Film, Clock, X, ChevronRight, Sparkles } from "lucide-react";
import { VideoProject } from "../types";

export interface SavedChatThread {
  id: string;
  title: string;
  prompt: string;
  sceneCount: number;
  updatedAt: string;
  project: VideoProject;
}

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedThreads: SavedChatThread[];
  activeThreadId?: string;
  onSelectThread: (thread: SavedChatThread) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  savedThreads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />

          {/* Drawer Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-[#111113] border-r border-white/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-title text-sm font-semibold text-white">
                  Video Chat Threads
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* New Video Chat Button */}
            <div className="p-4 border-b border-white/10">
              <button
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="w-full btn-primary py-2.5 text-xs font-semibold justify-center shadow-lg shadow-indigo-500/10"
              >
                <Plus className="w-4 h-4" />
                New Video Chat
              </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="px-2 py-1 text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
                Saved Projects ({savedThreads.length})
              </div>

              {savedThreads.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-white/10 rounded-xl">
                  <Film className="w-8 h-8 mx-auto text-text-tertiary mb-2 opacity-50" />
                  <p className="text-xs text-text-secondary font-medium">No saved chats yet</p>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    Your generated video projects will automatically save here!
                  </p>
                </div>
              ) : (
                savedThreads.map((thread) => {
                  const isActive = thread.id === activeThreadId;
                  return (
                    <div
                      key={thread.id}
                      className={`group relative rounded-xl p-3 border transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-500/10 border-indigo-500/40 text-white"
                          : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.05] text-text-secondary"
                      }`}
                      onClick={() => {
                        onSelectThread(thread);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                            {thread.title}
                          </h4>
                          <p className="text-[11px] text-text-tertiary truncate mt-0.5">
                            {thread.prompt}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteThread(thread.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-red-400 rounded hover:bg-white/10 transition-all"
                          title="Delete thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[10px] text-text-tertiary">
                        <span className="flex items-center gap-1 font-mono">
                          <Film className="w-3 h-3 text-indigo-400" />
                          {thread.sceneCount} scenes
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(thread.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-black/40 text-center">
              <span className="text-[11px] text-text-tertiary flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Auto-saved in Local Storage
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
