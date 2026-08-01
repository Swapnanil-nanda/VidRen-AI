"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Tool,
  BoardStyle,
  AspectRatio,
  VoiceOption,
  PlaybackSpeed,
  BgMusic,
  CanvasElement,
  VideoProject,
  ScenePlan,
  createEmptyScenePlan,
  createDefaultProject,
} from "../types";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { ScenePanel } from "./ScenePanel";
import { Timeline } from "./Timeline";
import { AIVoiceVisualizer } from "./AIVoiceVisualizer";
import { VideoFinalizerModal } from "./VideoFinalizerModal";
import { planVideoProject } from "../lib/aiPlanner";
import { DNA_REPLICATION_FIXTURE } from "../lib/fixtures";
import { speakNarration, stopNarration, setSpeechStateListener } from "../lib/speechSynthesis";

interface WhiteboardStudioProps {
  initialProject?: VideoProject;
  onBackToGenerator?: () => void;
}

export const WhiteboardStudio: React.FC<WhiteboardStudioProps> = ({
  initialProject,
  onBackToGenerator,
}) => {
  const [project, setProject] = useState<VideoProject>(
    initialProject || DNA_REPLICATION_FIXTURE
  );
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFinalizerModal, setShowFinalizerModal] = useState(false);

  const [activeTool, setActiveTool] = useState<Tool>("pen");
  const [brushSize, setBrushSize] = useState(4);
  const [activeColor, setActiveColor] = useState("#FFFFFF");
  const [boardStyle, setBoardStyle] = useState<BoardStyle>("blackboard");
  const [showGrid, setShowGrid] = useState(false);
  const [showRuledLines, setShowRuledLines] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [voiceover, setVoiceover] = useState<VoiceOption>("nova");

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [bgMusic, setBgMusic] = useState<BgMusic>("none");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState("");

  const currentScene: ScenePlan = project.scenes[activeSceneIndex] || project.scenes[0];
  const totalDuration = project.scenes.reduce((sum, s) => sum + (s.duration || 10), 0);

  useEffect(() => {
    setSpeechStateListener((state) => {
      setIsSpeaking(state.isSpeaking);
      setSpeakingText(state.currentText);
    });
  }, []);

  const handleGenerateFromPrompt = useCallback(async (promptText: string) => {
    setIsGenerating(true);
    stopNarration();
    setIsPlaying(false);

    try {
      const plannedProject = await planVideoProject(promptText, { targetDuration: "standard" });
      setProject(plannedProject);
      setActiveSceneIndex(0);
    } catch (err: any) {
      alert(`AI Plan Generation Failed: ${err.message || String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleAddScene = useCallback(() => {
    const newScene = createEmptyScenePlan(project.scenes.length);
    setProject((prev) => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
      updatedAt: new Date().toISOString(),
    }));
    setActiveSceneIndex(project.scenes.length);
  }, [project.scenes.length]);

  const handleDeleteScene = useCallback(
    (index: number) => {
      if (project.scenes.length <= 1) return;
      setProject((prev) => {
        const nextScenes = prev.scenes.filter((_, i) => i !== index);
        return {
          ...prev,
          scenes: nextScenes,
          updatedAt: new Date().toISOString(),
        };
      });
      if (activeSceneIndex >= index && activeSceneIndex > 0) {
        setActiveSceneIndex((prev) => prev - 1);
      }
    },
    [project.scenes.length, activeSceneIndex]
  );

  const handleDuplicateScene = useCallback(
    (index: number) => {
      const target = project.scenes[index];
      if (!target) return;
      const duplicated: ScenePlan = {
        ...target,
        id: `scene-${Date.now()}`,
        title: `${target.title} (Copy)`,
        sceneNumber: project.scenes.length + 1,
      };

      setProject((prev) => {
        const nextScenes = [...prev.scenes];
        nextScenes.splice(index + 1, 0, duplicated);
        return {
          ...prev,
          scenes: nextScenes,
          updatedAt: new Date().toISOString(),
        };
      });
      setActiveSceneIndex(index + 1);
    },
    [project.scenes]
  );

  const handleUpdateScene = useCallback(
    (index: number, updates: Partial<ScenePlan>) => {
      setProject((prev) => {
        const nextScenes = [...prev.scenes];
        if (nextScenes[index]) {
          nextScenes[index] = { ...nextScenes[index], ...updates };
        }
        return {
          ...prev,
          scenes: nextScenes,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      if (currentScene && currentScene.narration) {
        speakNarration(currentScene.narration, voiceover, isMuted, speed);
      }

      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const nextTime = prev + 0.2 * speed;
          const currentSceneDuration = currentScene?.duration || 10;

          if (nextTime >= currentSceneDuration) {
            if (activeSceneIndex < project.scenes.length - 1) {
              setActiveSceneIndex((idx) => idx + 1);
              return 0;
            } else {
              setIsPlaying(false);
              stopNarration();
              return currentSceneDuration;
            }
          }
          return nextTime;
        });
      }, 200);
    } else {
      stopNarration();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, activeSceneIndex, currentScene, project.scenes.length, speed, voiceover, isMuted]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#09090B] overflow-hidden font-sans">
      {}
      <Toolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        boardStyle={boardStyle}
        onBoardStyleChange={setBoardStyle}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((p) => !p)}
        showRuledLines={showRuledLines}
        onToggleRuledLines={() => setShowRuledLines((p) => !p)}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        voiceover={voiceover}
        onVoiceoverChange={setVoiceover}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        onExport={() => setShowFinalizerModal(true)}
        onBack={onBackToGenerator}
      />

      {}
      <div className="flex-1 flex overflow-hidden relative">
        <ScenePanel
          scenes={project.scenes}
          activeSceneIndex={activeSceneIndex}
          onSceneSelect={(idx) => {
            setActiveSceneIndex(idx);
            setCurrentTime(0);
          }}
          onAddScene={handleAddScene}
          onDeleteScene={handleDeleteScene}
          onDuplicateScene={handleDuplicateScene}
          onUpdateScene={handleUpdateScene}
          onGenerateFromPrompt={handleGenerateFromPrompt}
          isGenerating={isGenerating}
          boardStyle={boardStyle}
        />

        {}
        <div className="flex-1 h-full bg-[#111113] relative">
          <Canvas
            scenePlan={currentScene}
            elements={currentScene?.overlayElements || []}
            onElementsChange={(newElements) => handleUpdateScene(activeSceneIndex, { overlayElements: newElements })}
            activeTool={activeTool}
            brushSize={brushSize}
            activeColor={activeColor}
            boardStyle={boardStyle}
            showGrid={showGrid}
            showRuledLines={showRuledLines}
            currentTime={currentTime}
          />

          <AIVoiceVisualizer isSpeaking={isSpeaking} text={speakingText} />
        </div>
      </div>

      {}
      <Timeline
        scenes={project.scenes as any}
        activeSceneIndex={activeSceneIndex}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        speed={speed}
        onSpeedChange={setSpeed}
        currentTime={currentTime}
        totalDuration={totalDuration}
        onSeek={(t) => setCurrentTime(t)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((p) => !p)}
        bgMusic={bgMusic}
        onBgMusicChange={setBgMusic}
        isFullscreen={false}
        onToggleFullscreen={() => {}}
      />

      {}
      <VideoFinalizerModal
        isOpen={showFinalizerModal}
        onClose={() => setShowFinalizerModal(false)}
        project={project}
      />
    </div>
  );
};
