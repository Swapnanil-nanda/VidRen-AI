"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Play, Pause, ChevronRight, User, Sparkles, Film, Layers, Volume2, ShieldCheck, Zap } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { speakNarration, stopNarration, initSpeechSynthesis } from "../lib/speechSynthesis";
import { createFrameRenderer } from "../lib/sceneRenderer";
import { HISTORICAL_CURRICULUM } from "../lib/aiPlanner";

interface LandingPageProps {
  onLaunchStudio: () => void;
}

const FadeSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const GridBackground: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.06) 0%, transparent 70%)",
      }}
    />
    <div
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  </div>
);

const Navigation: React.FC<{ onLaunchStudio: () => void; onOpenAuth: () => void }> = ({
  onLaunchStudio,
  onOpenAuth,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090B]/80 backdrop-blur-xl border-b"
          : "bg-transparent border-b border-transparent"
      }`}
      style={{
        borderColor: scrolled ? "rgba(255,255,255,0.06)" : "transparent",
      }}
    >
      <div className="landing-container-wide flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent-gradient)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            VidRen
            <span className="text-text-tertiary font-normal ml-0.5">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Demo", "Process", "Features"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[13px] text-text-tertiary hover:text-text-primary transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAuth}
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-200 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02]"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            Sign in
          </button>
          <button
            onClick={onLaunchStudio}
            className="btn-primary text-[13px] px-4 py-2"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

const HeroSection: React.FC<{ onLaunchStudio: () => void; onTriggerDemo: () => void }> = ({
  onLaunchStudio,
  onTriggerDemo,
}) => {
  return (
    <section className="relative pt-40 pb-8 px-6">
      <div className="landing-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <a
            href="#demo"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--accent-gradient)" }}
            />
            Introducing VidRen AI — Motion Graphic Studio
            <ChevronRight className="w-3 h-3 text-text-tertiary" />
          </a>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-display mt-8 mb-5"
        >
          <span className="gradient-text-subtle">Ideas become</span>
          <br />
          <span className="gradient-text">visual knowledge</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-body max-w-lg mx-auto mb-10"
          style={{ fontSize: "1.0625rem", lineHeight: 1.65 }}
        >
          Transform PDFs, research papers, data charts, and raw ideas into
          interactive visual video experiences — powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex items-center justify-center gap-3"
        >
          <button onClick={onLaunchStudio} className="btn-primary px-6 py-3">
            Start creating
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={onTriggerDemo} className="btn-secondary px-5 py-3 shadow-lg shadow-indigo-500/10">
            <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            Watch demo
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const FrenchRevolutionDemoPlayer: React.FC<{ isPlaying: boolean; onTogglePlay: () => void }> = ({
  isPlaying,
  onTogglePlay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneIdx, setSceneIdx] = useState(0);

  const scenes = HISTORICAL_CURRICULUM.slice(0, 6);
  const currentScene = scenes[sceneIdx % scenes.length];

  useEffect(() => {
    if (typeof window === "undefined") return;
    let animFrame: number;
    let startTime = performance.now();

    const render = (now: number) => {
      const canvas = canvasRef.current;
      if (canvas && currentScene) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          const elapsed = (now - startTime) / 1000;
          const duration = (currentScene as any).duration || 10;

          if (elapsed >= duration && isPlaying) {
            startTime = now;
            setSceneIdx((prev) => (prev + 1) % scenes.length);
          }

          ctx.clearRect(0, 0, width, height);
          const frameRenderer = createFrameRenderer(currentScene as any, {
            width,
            height,
            fps: 60,
            style: "modern",
          });
          frameRenderer(ctx, elapsed % duration, duration);
        }
      }
      if (isPlaying) {
        animFrame = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      initSpeechSynthesis();
      speakNarration(currentScene.narration, "fable", false, 0.95, 1.0); // British Narrator (fable)
      animFrame = requestAnimationFrame(render);
    } else {
      stopNarration();
      const canvas = canvasRef.current;
      if (canvas && currentScene) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const frameRenderer = createFrameRenderer(currentScene as any, {
            width: canvas.width,
            height: canvas.height,
            fps: 60,
            style: "modern",
          });
          frameRenderer(ctx, 3, 10);
        }
      }
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isPlaying, sceneIdx, currentScene]);

  return (
    <div id="demo" className="relative rounded-2xl p-2 border border-white/10 bg-white/[0.02] shadow-2xl overflow-hidden">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#09090B] border border-white/5 group">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-cover"
        />

        {/* Demo Overlay Banner */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>French Revolution Demo Video (British Voice)</span>
        </div>

        {/* Play / Pause Controls Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all pointer-events-none">
          <button
            onClick={onTogglePlay}
            className="pointer-events-auto w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl transition-all scale-95 group-hover:scale-100"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProcessStepSection: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Input your topic or prompt",
      description: "Enter any research paper, medical standard, deep neural net formula, or historical event.",
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
    },
    {
      step: "02",
      title: "AI scene decomposition",
      description: "Our multi-agent engine plans 5 to 25 structured scenes with customized vector graphics.",
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
    },
    {
      step: "03",
      title: "Continuous British voice narration",
      description: "Generates continuous linear documentary voiceover with humanized speech pacing.",
      icon: <Volume2 className="w-5 h-5 text-emerald-400" />,
    },
    {
      step: "04",
      title: "Export & share video",
      description: "Download 60FPS WebM video, animated GIF, or edit frames on the interactive canvas.",
      icon: <Film className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <section id="process" className="landing-section">
      <div className="landing-container">
        <FadeSection className="text-center mb-16">
          <p className="text-caption uppercase tracking-widest mb-3 font-medium text-accent">
            Step-by-Step Process
          </p>
          <h2 className="text-headline gradient-text-subtle">
            How VidRen AI turns prompts into visual lessons
          </h2>
        </FadeSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <FadeSection key={s.step} delay={idx * 0.1}>
              <div className="card p-6 h-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-indigo-400 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20">
                    STEP {s.step}
                  </span>
                  {s.icon}
                </div>
                <h3 className="text-title text-base font-semibold text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-body text-xs text-text-tertiary leading-relaxed">
                  {s.description}
                </p>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  );
};

const CapabilitiesSection: React.FC = () => {
  const capabilities = [
    {
      title: "Multi-agent orchestration",
      description:
        "Specialized AI agents handle scene layout, visual design, script writing, and voice synthesis.",
    },
    {
      title: "3D & Vector Motion Graphics",
      description:
        "Procedurally generated 3D wireframe models — DNA helixes, Bloch spheres, neural networks — rendered smoothly.",
    },
    {
      title: "Humanized British AI Voice",
      description:
        "Default British narrator (fable) with speech pacing, subtle filler transitions, and natural emphasis.",
    },
    {
      title: "Multi-format export",
      description:
        "Export as WebM video, animated GIF, or high-resolution PNG. Choose resolution and aspect ratios.",
    },
    {
      title: "Smart scene decomposition",
      description:
        "AI automatically breaks complex topics into digestible scenes with logical flow.",
    },
    {
      title: "Interactive canvas",
      description:
        "Full-featured drawing tools — pen, highlighter, shapes, sticky notes, and math formulas with LaTeX support.",
    },
  ];

  return (
    <section id="features" className="landing-section">
      <div className="landing-container">
        <FadeSection className="text-center mb-16">
          <p className="text-caption uppercase tracking-widest mb-3 font-medium">
            Capabilities
          </p>
          <h2 className="text-headline gradient-text-subtle">
            Built for depth, designed for clarity
          </h2>
        </FadeSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <FadeSection key={cap.title} delay={i * 0.08}>
              <div className="card p-6 h-full">
                <h3 className="text-title text-text-primary mb-2.5">
                  {cap.title}
                </h3>
                <p className="text-body text-[14px]">{cap.description}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  );
};

const BottomCTA: React.FC<{ onLaunchStudio: () => void }> = ({
  onLaunchStudio,
}) => (
  <section className="landing-section">
    <div className="landing-container text-center">
      <FadeSection>
        <div
          className="py-20 px-8 rounded-lg"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            background:
              "linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, rgba(9, 9, 11, 0) 100%)",
          }}
        >
          <h2 className="text-headline gradient-text-subtle mb-4">
            Start building knowledge, visually
          </h2>
          <p className="text-body max-w-md mx-auto mb-8">
            Open the studio, describe your topic, and export your video project in minutes.
          </p>
          <button onClick={onLaunchStudio} className="btn-primary px-6 py-3">
            Open Studio
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </FadeSection>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer
    className="px-6 py-8"
    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
  >
    <div className="landing-container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ background: "var(--accent-gradient)" }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span className="text-[13px] font-medium text-text-tertiary">
          VidRen AI
        </span>
      </div>
      <div className="flex items-center gap-6">
        {["Privacy", "Terms", "GitHub"].map((link) => (
          <a
            key={link}
            href="#"
            className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors duration-200"
          >
            {link}
          </a>
        ))}
      </div>
      <p className="text-[12px] text-text-tertiary">
        © {new Date().getFullYear()} VidRen AI
      </p>
    </div>
  </footer>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchStudio }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const handleTriggerDemo = () => {
    setIsPlayingDemo(true);
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white overflow-x-hidden overflow-y-auto">
      <GridBackground />
      <Navigation onLaunchStudio={onLaunchStudio} onOpenAuth={() => setShowAuthModal(true)} />
      <HeroSection onLaunchStudio={onLaunchStudio} onTriggerDemo={handleTriggerDemo} />
      
      <div className="landing-container px-6">
        <FrenchRevolutionDemoPlayer
          isPlaying={isPlayingDemo}
          onTogglePlay={() => setIsPlayingDemo((p) => !p)}
        />
      </div>

      <ProcessStepSection />
      <div className="separator landing-container-wide" />
      <CapabilitiesSection />
      <BottomCTA onLaunchStudio={onLaunchStudio} />
      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(u) => setUser(u)}
      />
    </div>
  );
};
