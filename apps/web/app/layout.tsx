import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VidRen AI — Transform knowledge into visual experiences",
  description:
    "AI-powered platform that transforms PDFs, GitHub repos, research papers, and ideas into interactive whiteboard videos with 3D animations and AI narration.",
  keywords: [
    "AI video generation",
    "whiteboard animation",
    "knowledge visualization",
    "educational AI",
    "explainer videos",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
