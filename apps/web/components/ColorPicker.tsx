"use client";

import React from "react";
import { CHALK_COLORS } from "../types";

interface ColorPickerProps {
  activeColor: string;
  onColorChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  activeColor,
  onColorChange,
}) => {
  return (
    <div className="flex items-center gap-1">
      {CHALK_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          className={`w-5 h-5 rounded-full transition-all border-2 hover:scale-110 ${
            activeColor === color
              ? "border-white shadow-lg scale-110"
              : "border-slate-700 hover:border-slate-500"
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}

      {/* Custom color input */}
      <label className="relative cursor-pointer">
        <div
          className={`w-5 h-5 rounded-full border-2 border-dashed border-slate-600 hover:border-slate-400 transition-all flex items-center justify-center text-[8px] text-slate-500 overflow-hidden`}
          title="Custom color"
        >
          <span>+</span>
        </div>
        <input
          type="color"
          value={activeColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-5 h-5"
        />
      </label>
    </div>
  );
};
