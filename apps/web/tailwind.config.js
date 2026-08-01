/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        foreground: "#FAFAFA",
        card: "#111113",
        elevated: "#18181B",
        "border-subtle": "rgba(255, 255, 255, 0.06)",
        "border-medium": "rgba(255, 255, 255, 0.10)",
        "text-primary": "#FAFAFA",
        "text-secondary": "#A1A1AA",
        "text-tertiary": "#71717A",
        accent: {
          DEFAULT: "#6366F1",
          light: "#8B5CF6",
          dark: "#4F46E5",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "chalk-draw": "chalkDraw 0.6s ease-out forwards",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        chalkDraw: {
          "0%": { strokeDashoffset: "100%", opacity: "0" },
          "100%": { strokeDashoffset: "0%", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
