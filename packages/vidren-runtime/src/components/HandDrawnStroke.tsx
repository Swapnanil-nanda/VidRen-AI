"use client";

import React from "react";

interface HandDrawnStrokeProps {
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const HandDrawnStroke: React.FC<HandDrawnStrokeProps> = ({
  color = "#38bdf8",
  width = 200,
  height = 12,
  className = "",
}) => {
  // Generate slightly randomized organic vector path
  const pathData = `M 5,${height / 2 + 2} Q ${width * 0.35},${height / 4} ${width * 0.7},${height / 2 - 1} T ${width - 5},${height / 2 + 1}`;
  const pathDataDouble = `M 8,${height / 2 + 4} Q ${width * 0.4},${height / 2 + 5} ${width * 0.75},${height / 2 + 3} T ${width - 10},${height / 2 + 5}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      <path
        d={pathData}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 500,
          strokeDashoffset: 0,
          transition: "stroke-dashoffset 0.8s ease-out",
        }}
      />
      <path
        d={pathDataDouble}
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
};
