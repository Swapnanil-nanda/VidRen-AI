// ============================================================
// Web Speech API & Web Audio Synthesizer Engine
// Continuous Master Script Speech Synthesis (Zero Scene-Boundary Pauses!)
// ============================================================

import { VoiceOption } from "../types";

export interface SpeechState {
  isSpeaking: boolean;
  currentText: string;
}

declare global {
  interface Window {
    _activeUtteranceRef?: SpeechSynthesisUtterance | null;
    _audioContextRef?: AudioContext | null;
    _activeUtteranceText?: string;
  }
}

let speechStateListener: ((state: SpeechState) => void) | null = null;

export function setSpeechStateListener(listener: (state: SpeechState) => void) {
  speechStateListener = listener;
}

function notifyState(isSpeaking: boolean, text: string = "") {
  if (speechStateListener) {
    speechStateListener({ isSpeaking, currentText: text });
  }
}

/** AudioContext Sound Generator (Plays pleasant audio chime & unlocks browser audio) */
export function playAudioChime(freq: number = 440, durationMs: number = 200, volume: number = 0.3): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!window._audioContextRef || window._audioContextRef.state === "closed") {
      window._audioContextRef = new AudioContextClass();
    }

    const ctx = window._audioContextRef;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (err) {
    console.warn("AudioContext chime failed:", err);
  }
}

/** Pre-warm speech synthesis & unlock audio on user interaction */
export function initSpeechSynthesis(): void {
  if (typeof window !== "undefined") {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      if (synth.paused) {
        synth.resume();
      }
      synth.getVoices();
    }
    playAudioChime(523.25, 100, 0.05); // Subtle C5 audio unlock chime
  }
}

export function stopNarration(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    window._activeUtteranceRef = null;
    window._activeUtteranceText = "";
    notifyState(false, "");
  }
}

/**
 * Continuous Master Script Narrator Engine:
 * Speaks the complete, unified Master Documentary Script as a single, uninterrupted speech utterance!
 * Eliminates all scene-boundary audio pauses, stops, and repetitive restarts!
 */
export function speakMasterScriptContinuously(
  masterScriptText: string,
  voiceOption: VoiceOption = "nova",
  isMuted: boolean = false,
  speed: number = 1.0,
  volume: number = 1.0
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const synth = window.speechSynthesis;

  if (synth.paused) {
    synth.resume();
  }

  // Continuous speech protection: do NOT restart if already speaking the exact master script!
  if (synth.speaking && window._activeUtteranceText === masterScriptText) {
    return;
  }

  stopNarration();
  window._activeUtteranceText = masterScriptText;

  if (isMuted || volume <= 0 || !masterScriptText.trim()) {
    return;
  }

  playAudioChime(659.25, 120, 0.12 * volume); // E5 subtle start tone

  const utterance = new SpeechSynthesisUtterance(masterScriptText);
  utterance.volume = Math.min(Math.max(volume, 0), 1);

  // Configure natural human conversational voice properties
  switch (voiceOption) {
    case "alloy":
      utterance.pitch = 0.96;
      utterance.rate = 0.94 * speed;
      break;
    case "echo":
      utterance.pitch = 0.90;
      utterance.rate = 0.93 * speed;
      break;
    case "fable":
      utterance.pitch = 1.04;
      utterance.rate = 0.96 * speed;
      break;
    case "nova":
    default:
      utterance.pitch = 1.02;
      utterance.rate = 0.95 * speed;
      break;
  }

  window._activeUtteranceRef = utterance;

  const performSpeak = () => {
    const voices = synth.getVoices();
    if (voices.length > 0) {
      let selectedVoice: SpeechSynthesisVoice | undefined;

      switch (voiceOption) {
        case "alloy":
          selectedVoice =
            voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Male") || v.name.includes("David") || v.name.includes("Guy") || v.name.includes("George"))) ||
            voices.find((v) => v.lang.startsWith("en") && !v.name.includes("Female") && !v.name.includes("Zira"));
          break;
        case "fable":
          selectedVoice =
            voices.find((v) => v.lang.includes("GB") || v.name.includes("UK") || v.name.includes("British") || v.name.includes("Oliver") || v.name.includes("Arthur")) ||
            voices.find((v) => v.lang.startsWith("en"));
          break;
        case "echo":
          selectedVoice =
            voices.find((v) => v.name.includes("Hazel") || v.name.includes("Alex") || v.name.includes("Fred") || v.name.includes("Cellos")) ||
            voices.find((v) => v.lang.startsWith("en"));
          break;
        case "nova":
        default:
          selectedVoice =
            voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("Jenny") || v.name.includes("Victoria"))) ||
            voices.find((v) => v.lang.startsWith("en"));
          break;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      notifyState(true, masterScriptText);
    };

    utterance.onend = () => {
      window._activeUtteranceRef = null;
      window._activeUtteranceText = "";
      notifyState(false, "");
    };

    utterance.onerror = (e) => {
      console.warn("Continuous speech synthesis error:", e);
      window._activeUtteranceRef = null;
      window._activeUtteranceText = "";
      notifyState(false, "");
    };

    try {
      synth.speak(utterance);
    } catch (err) {
      console.warn("Failed to invoke synth.speak:", err);
    }
  };

  if (synth.getVoices().length > 0) {
    performSpeak();
  } else {
    synth.onvoiceschanged = () => {
      synth.onvoiceschanged = null;
      performSpeak();
    };
  }
}

export function speakNarration(
  text: string,
  voiceOption: VoiceOption = "nova",
  isMuted: boolean = false,
  speed: number = 1,
  volume: number = 1
): void {
  speakMasterScriptContinuously(text, voiceOption, isMuted, speed, volume);
}
