import React from "react";

interface EyesProps {
  cx: number;
  cy: number;
  size: number; // roughly the eye radius, callers scale this per-country
  mood: "neutral" | "calm" | "angry";
  color: string;
}

export const Eyes: React.FC<EyesProps> = ({ cx, cy, size, mood, color }) => {
  const spacing = size * 1.3;
  const eyeRx = size * 0.65;
  const eyeRy = size * 0.8;
  const browColor = mood === "neutral" ? "#2c3e50" : color;

  const eye = (ex: number) => (
    <g key={ex}>
      <ellipse
        cx={ex}
        cy={cy}
        rx={eyeRx}
        ry={eyeRy}
        fill="white"
        stroke="#0d1117"
        strokeWidth={size * 0.08}
      />
      <circle cx={ex} cy={cy + eyeRy * 0.25} r={eyeRy * 0.4} fill="#111" />
    </g>
  );

  const brow = (ex: number, side: "left" | "right") => {
    const dir = side === "left" ? -1 : 1;
    if (mood === "angry") {
      const x0 = ex - dir * eyeRx * 1.1;
      const x1 = ex + dir * eyeRx * 0.9;
      const yInner = cy - eyeRy * 1.5;
      const yOuter = cy - eyeRy * 0.6;
      // Slanted "V" brows pointing down toward the nose bridge.
      const innerX = side === "left" ? x1 : x0;
      const outerX = side === "left" ? x0 : x1;
      return (
        <line
          key={ex}
          x1={outerX}
          y1={yOuter}
          x2={innerX}
          y2={yInner}
          stroke={browColor}
          strokeWidth={size * 0.28}
          strokeLinecap="round"
        />
      );
    }
    return (
      <path
        key={ex}
        d={`M ${ex - eyeRx} ${cy - eyeRy * 1.1} Q ${ex} ${
          cy - eyeRy * 1.6
        } ${ex + eyeRx} ${cy - eyeRy * 1.1}`}
        fill="none"
        stroke={browColor}
        strokeWidth={size * 0.22}
        strokeLinecap="round"
      />
    );
  };

  return (
    <g>
      {eye(cx - spacing)}
      {eye(cx + spacing)}
      {brow(cx - spacing, "left")}
      {brow(cx + spacing, "right")}
    </g>
  );
};
