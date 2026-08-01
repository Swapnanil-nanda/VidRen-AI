"use client";

import React from "react";
import { TypographyElement } from "@vidren/dsl";
import { HandDrawnStroke } from "../components/HandDrawnStroke";

export const TypographyWidget: React.FC<{ element: TypographyElement }> = ({ element }) => {
  const { variant, content, title } = element;

  switch (variant) {
    case "h1":
      return (
        <div className="my-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono flex flex-col items-start gap-1">
            <span>{content}</span>
            <HandDrawnStroke width={280} color="#38bdf8" />
          </h1>
        </div>
      );
    case "h2":
      return (
        <div className="my-3">
          <h2 className="text-2xl font-bold text-sky-400 font-sans tracking-wide">
            {content}
          </h2>
        </div>
      );
    case "h3":
      return (
        <h3 className="text-lg font-semibold text-slate-200 my-2">
          {content}
        </h3>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-sky-500 pl-4 py-2 my-3 italic text-slate-300 bg-slate-900/60 rounded-r-lg">
          "{content}"
        </blockquote>
      );
    case "callout":
      return (
        <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-4 my-3 backdrop-blur-md">
          {title && <h4 className="font-semibold text-sky-300 text-sm mb-1">{title}</h4>}
          <p className="text-slate-200 text-sm leading-relaxed">{content}</p>
        </div>
      );
    default:
      return <p className="text-slate-300 leading-relaxed my-2">{content}</p>;
  }
};
