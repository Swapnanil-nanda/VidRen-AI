"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Play, ChevronRight } from "lucide-react";

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
    {}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.06) 0%, transparent 70%)",
      }}
    />
    {}
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

const Navigation: React.FC<{ onLaunchStudio: () => void }> = ({
  onLaunchStudio,
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
        {}
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

        {}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it works", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[13px] text-text-tertiary hover:text-text-primary transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        {}
        <div className="flex items-center gap-3">
          <button className="hidden sm:inline-flex text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-200 px-3 py-1.5">
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

const HeroSection: React.FC<{ onLaunchStudio: () => void }> = ({
  onLaunchStudio,
}) => {
  return (
    <section className="relative pt-40 pb-8 px-6">
      <div className="landing-container text-center">
        {}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <a
            href="#features"
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
            Introducing VidRen AI — Now in Beta
            <ChevronRight className="w-3 h-3 text-text-tertiary" />
          </a>
        </motion.div>

        {}
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

        {}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-body max-w-lg mx-auto mb-10"
          style={{ fontSize: "1.0625rem", lineHeight: 1.65 }}
        >
          Transform PDFs, repos, research papers, and raw ideas into
          interactive visual experiences — powered by AI.
        </motion.p>

        {}
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
          <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary px-5 py-3">
            <Play className="w-3.5 h-3.5" />
            Watch demo
          </button>
        </motion.div>

        {}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-caption mt-8"
        >
          Free to start · No credit card required
        </motion.p>
      </div>
    </section>
  );
};

const ProductPreview: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.6, 1]);

  return (
    <section className="relative px-6 pt-12 pb-24" ref={ref}>
      <div className="landing-container-wide">
        <motion.div
          style={{ y, scale, opacity }}
          className="browser-chrome"
        >
          {}
          <div className="browser-chrome-bar">
            <div className="flex items-center gap-1.5 mr-4">
              <span
                className="browser-dot"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <span
                className="browser-dot"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <span
                className="browser-dot"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
            </div>
            <div
              className="flex-1 max-w-xs mx-auto h-7 rounded-md flex items-center justify-center px-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span className="text-[11px] text-text-tertiary font-mono">
                app.vidren.ai/studio
              </span>
            </div>
          </div>

          {}
          <div className="relative aspect-[16/9] bg-[#09090B] overflow-hidden">
            {}
            <div className="absolute inset-0 flex">
              {}
              <div
                className="w-64 h-full flex-shrink-0 flex flex-col"
                style={{
                  background: "#0F0F11",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {}
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
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
                  <span className="text-[12px] font-medium text-text-primary">
                    Scenes
                  </span>
                  <span className="ml-auto text-[10px] text-text-tertiary px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)" }}>
                    4
                  </span>
                </div>

                {}
                <div className="flex-1 p-2 space-y-1.5 overflow-hidden">
                  {[
                    { label: "Introduction", active: false },
                    { label: "DNA Structure", active: true },
                    { label: "Protein Synthesis", active: false },
                    { label: "Summary", active: false },
                  ].map((scene, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-2.5 transition-all"
                      style={{
                        background: scene.active
                          ? "rgba(99, 102, 241, 0.08)"
                          : "transparent",
                        border: scene.active
                          ? "1px solid rgba(99, 102, 241, 0.2)"
                          : "1px solid transparent",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono font-medium w-4 h-4 rounded flex items-center justify-center"
                          style={{
                            background: scene.active
                              ? "rgba(99, 102, 241, 0.2)"
                              : "rgba(255,255,255,0.04)",
                            color: scene.active
                              ? "#818CF8"
                              : "var(--text-tertiary)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="text-[11px] font-medium"
                          style={{
                            color: scene.active
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                          }}
                        >
                          {scene.label}
                        </span>
                      </div>
                      {}
                      <div
                        className="mt-2 h-12 rounded"
                        style={{
                          background: scene.active
                            ? "linear-gradient(135deg, #1a1a2e 0%, #1e1b4b 100%)"
                            : "rgba(255,255,255,0.02)",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div className="flex-1 flex flex-col">
                {}
                <div
                  className="h-11 flex items-center px-4 gap-3"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "#0C0C0E",
                  }}
                >
                  {}
                  {["M12 19l7-7 3 3-7 7-3-3z", "M2 12l10 10", "M15 3l6 6"].map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-md flex items-center justify-center"
                        style={{
                          background:
                            i === 0
                              ? "rgba(99, 102, 241, 0.15)"
                              : "transparent",
                          border:
                            i === 0
                              ? "1px solid rgba(99, 102, 241, 0.25)"
                              : "1px solid transparent",
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{
                            background:
                              i === 0
                                ? "#6366F1"
                                : "rgba(255,255,255,0.12)",
                          }}
                        />
                      </div>
                    )
                  )}
                  <div className="w-px h-5 bg-[rgba(255,255,255,0.06)] mx-1" />
                  {}
                  {["#6366F1", "#F97316", "#22C55E", "#F43F5E"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: color,
                          opacity: i === 0 ? 1 : 0.5,
                          boxShadow:
                            i === 0
                              ? `0 0 0 2px #09090B, 0 0 0 3px ${color}`
                              : "none",
                        }}
                      />
                    )
                  )}
                </div>

                {}
                <div className="flex-1 relative bg-[#1a1a2e]">
                  {}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4))]" />

                  {}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {}
                    <svg
                      width="280"
                      height="200"
                      viewBox="0 0 280 200"
                      className="opacity-80"
                    >
                      {}
                      <motion.path
                        d="M40 100 Q70 30 100 100 Q130 170 160 100 Q190 30 220 100 Q250 170 280 100"
                        stroke="#6366F1"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2.5, delay: 0.5 }}
                      />
                      <motion.path
                        d="M40 100 Q70 170 100 100 Q130 30 160 100 Q190 170 220 100 Q250 30 280 100"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2.5, delay: 0.7 }}
                      />
                      {}
                      {[70, 100, 130, 160, 190, 220, 250].map((x, i) => (
                        <motion.line
                          key={i}
                          x1={x}
                          y1={80 + (i % 2 === 0 ? -15 : 15)}
                          x2={x}
                          y2={120 + (i % 2 === 0 ? 15 : -15)}
                          stroke="rgba(139, 92, 246, 0.3)"
                          strokeWidth="1"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 1 + i * 0.15 }}
                        />
                      ))}
                    </svg>

                    {}
                    <div className="absolute bottom-12 left-8">
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.5 }}
                      >
                        <p className="text-[11px] font-mono text-text-tertiary mb-1">
                          Scene 2 of 4
                        </p>
                        <h3
                          className="text-xl font-semibold text-white/90"
                          style={{
                            fontFamily:
                              "'Segoe Script', 'Comic Sans MS', cursive",
                          }}
                        >
                          DNA Double Helix
                        </h3>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {}
                <div
                  className="h-10 flex items-center px-4 gap-3"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    background: "#0C0C0E",
                  }}
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[rgba(255,255,255,0.04)]">
                    <Play className="w-3 h-3 text-text-secondary" />
                  </div>
                  <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "var(--accent-gradient)" }}
                      initial={{ width: "0%" }}
                      whileInView={{ width: "38%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary">
                    0:47 / 2:05
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const DemoSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Type your prompt",
      desc: "Drop a PDF or just type what you want to learn.",
      preview: (
        <div className="flex flex-col gap-2 p-4 h-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--accent-gradient)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <span className="text-xs text-text-tertiary">New Project</span>
          </div>
          <div className="bg-[#121214] border border-white/5 rounded-lg p-3">
            <p className="text-sm text-text-secondary">Explain the French Revolution...</p>
            <motion.div
              className="w-1 h-4 bg-indigo-500 mt-1"
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          </div>
        </div>
      )
    },
    {
      num: "02",
      title: "AI generates scenes",
      desc: "Content is structured into logical visual scenes.",
      preview: (
        <div className="flex flex-col gap-2 p-4 h-full">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="h-10 bg-[#121214] border border-white/5 rounded-md flex items-center px-3 gap-2"
            >
              <div className="w-4 h-4 rounded bg-indigo-500/20 flex items-center justify-center">
                <span className="text-[10px] text-indigo-400">{i}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full w-24" />
            </motion.div>
          ))}
        </div>
      )
    },
    {
      num: "03",
      title: "Watch your video",
      desc: "Instant playback with synced voiceover & animations.",
      preview: (
        <div className="flex flex-col p-4 h-full relative">
          <div className="flex-1 bg-black rounded-t-md overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Play className="w-4 h-4 text-white ml-1" />
              </div>
            </div>
          </div>
          <div className="h-8 bg-[#121214] rounded-b-md border border-white/5 border-t-0 flex items-center px-3">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 4, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      num: "04",
      title: "Export & share",
      desc: "Download in multiple formats or share directly.",
      preview: (
        <div className="flex items-center justify-center h-full p-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center gap-2"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </motion.div>
            <span className="text-xs text-indigo-400 font-medium">MP4</span>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <section id="demo" className="landing-section">
      <div className="landing-container">
        <FadeSection className="text-center mb-16">
          <p className="text-caption uppercase tracking-widest mb-3 font-medium">
            See VidRen AI in Action
          </p>
          <h2 className="text-headline gradient-text-subtle">
            Watch how a simple text prompt transforms into a full animated educational video
          </h2>
        </FadeSection>

        <div className="relative">
          {}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px" style={{ borderLeft: '2px dotted rgba(255,255,255,0.1)' }} />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <FadeSection key={step.num} delay={i * 0.1} className="relative z-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                  {}
                  <div className="flex-shrink-0 bg-[#09090B] p-2 rounded-full hidden md:block -ml-[22px]">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-sm">
                      {step.num}
                    </div>
                  </div>
                  
                  {}
                  <div className="md:hidden w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-xs mb-2">
                    {step.num}
                  </div>

                  {}
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">{step.title}</h3>
                    <p className="text-text-secondary text-sm mb-6">{step.desc}</p>
                  </div>

                  {}
                  <div className="w-full md:w-[320px] h-[180px] bg-[#09090B] border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                    {step.preview}
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      label: "Input anything",
      title: "PDFs, repos, papers, ideas.",
      description:
        "Drop a PDF, paste a GitHub URL, link a research paper, or just describe what you want to learn. VidRen extracts structure automatically.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: "AI generates",
      title: "Scenes, visuals, narration.",
      description:
        "Multi-agent AI breaks your content into scenes, generates 3D visuals, chalk animations, and writes a voiceover script — all in seconds.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      label: "Export & share",
      title: "Videos that teach.",
      description:
        "Export narrated whiteboard videos with AI voiceover, 3D animations, and chalk-style visuals. Ready for YouTube, courses, or presentations.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="landing-section">
      <div className="landing-container">
        {}
        <FadeSection className="text-center mb-16">
          <p className="text-caption uppercase tracking-widest mb-3 font-medium">
            How it works
          </p>
          <h2 className="text-headline gradient-text-subtle">
            From raw knowledge to visual understanding
          </h2>
        </FadeSection>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden">
          {features.map((feature, i) => (
            <FadeSection
              key={feature.label}
              delay={i * 0.1}
              className="bg-[#09090B] p-8 md:p-10"
            >
              {}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-6"
                style={{
                  background: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.12)",
                  color: "#818CF8",
                }}
              >
                {feature.icon}
              </div>

              {}
              <p className="text-[12px] font-medium uppercase tracking-wider text-accent mb-2">
                {feature.label}
              </p>

              {}
              <h3 className="text-title text-text-primary mb-3">
                {feature.title}
              </h3>

              {}
              <p className="text-body text-[14px]">{feature.description}</p>
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
        "Specialized AI agents handle scene layout, visual design, script writing, and voice synthesis — working together like a production team.",
    },
    {
      title: "3D & chalk animations",
      description:
        "Procedurally generated 3D models — DNA helixes, Bloch spheres, neural networks — rendered with authentic chalk-on-board textures.",
    },
    {
      title: "AI voiceover",
      description:
        "Choose from multiple AI voices. Each scene gets perfectly synchronized narration with natural pacing and emphasis.",
    },
    {
      title: "Multi-format export",
      description:
        "Export as WebM video, animated GIF, or high-resolution PNG. Choose resolution, aspect ratio, and quality settings.",
    },
    {
      title: "Smart scene decomposition",
      description:
        "AI automatically breaks complex topics into digestible scenes with logical flow, transitions, and visual hierarchy.",
    },
    {
      title: "Interactive canvas",
      description:
        "Full-featured drawing tools — pen, highlighter, shapes, sticky notes, and embedded math formulas with LaTeX support.",
    },
  ];

  return (
    <section id="how-it-works" className="landing-section">
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
            No account required. Open the studio, drop your content, and
            export your first video in minutes.
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
  return (
    <div className="min-h-screen bg-[#09090B] text-white overflow-x-hidden overflow-y-auto">
      <GridBackground />
      <Navigation onLaunchStudio={onLaunchStudio} />
      <HeroSection onLaunchStudio={onLaunchStudio} />
      <ProductPreview />
      <div className="separator landing-container-wide" />
      <DemoSection />
      <div className="separator landing-container-wide" />
      <FeaturesSection />
      <div className="separator landing-container-wide" />
      <CapabilitiesSection />
      <BottomCTA onLaunchStudio={onLaunchStudio} />
      <Footer />
    </div>
  );
};
