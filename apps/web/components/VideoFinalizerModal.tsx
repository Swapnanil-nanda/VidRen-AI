"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Download, Check, X, AlertCircle } from "lucide-react";
import { VideoProject, VIDEO_RESOLUTIONS, VideoResolution } from "../types";
import { composeVideo } from "../lib/videoCompositor";

interface VideoFinalizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
}

export const VideoFinalizerModal: React.FC<VideoFinalizerModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [resolution, setResolution] = useState<VideoResolution>("1080p");
  const [isExporting, setIsExporting] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [videoResult, setVideoResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalDuration = project.scenes.reduce((sum, s) => sum + (s.duration || 10), 0);

  const handleStartExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    setProgressPercent(0);
    setProgressMessage("Initializing frame composition engine...");

    try {
      const resConfig = VIDEO_RESOLUTIONS[resolution];
      const result = await composeVideo(
        {
          width: resConfig.width,
          height: resConfig.height,
          fps: 20,
          scenes: project.scenes,
          style: "modern",
          voiceOption: project.voiceover || "nova",
        },
        (prog) => {
          setProgressPercent(prog.progress);
          setProgressMessage(prog.message);
        }
      );

      setVideoResult({
        url: result.videoUrl,
        blob: result.videoBlob,
      });
      setIsExporting(false);
    } catch (err: any) {
      console.error("Export error:", err);
      setErrorMessage(err.message || "Export failed.");
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!videoResult) return;
    const a = document.createElement("a");
    a.href = videoResult.url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, "_")}_export.webm`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl p-6 rounded-2xl border border-white/10 bg-[#111113] shadow-2xl relative text-white"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-text-tertiary hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Export WebM Motion Graphics Video
              </h3>
              <p className="text-xs text-text-tertiary">
                Renders all {project.scenes.length} AI scenes into a high-performance WebM video file.
              </p>
            </div>
          </div>

          {/* Resolution Selector */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Select Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["720p", "1080p", "4k"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  disabled={isExporting}
                  className={`py-2 rounded-lg text-xs font-mono border transition-all ${
                    resolution === r
                      ? "border-indigo-500 bg-indigo-500/10 text-white font-bold"
                      : "border-white/5 bg-white/[0.02] text-text-tertiary hover:border-white/10"
                  }`}
                >
                  {r} ({VIDEO_RESOLUTIONS[r].width}×{VIDEO_RESOLUTIONS[r].height})
                </button>
              ))}
            </div>
          </div>

          {/* Progress / Status Display */}
          {isExporting && (
            <div className="mb-6 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-indigo-300">{progressMessage}</span>
                <span className="text-white font-bold">{progressPercent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--accent-gradient)" }}
                  animate={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Video Download Preview */}
          {videoResult && (
            <div className="mb-6 space-y-3">
              <video
                src={videoResult.url}
                controls
                className="w-full aspect-video rounded-xl border border-white/10 bg-black"
              />
              <button
                onClick={handleDownload}
                className="w-full btn-primary py-2.5 text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download WebM Video ({Math.round(totalDuration)}s)</span>
              </button>
            </div>
          )}

          {!videoResult && (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="w-full btn-primary py-3 text-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Film className="w-4 h-4" />
              <span>{isExporting ? "Rendering Video..." : "Start Video Export"}</span>
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
