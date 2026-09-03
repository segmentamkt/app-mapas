import React from "react";

interface EyesProps {
  cx: number;
  cy: number;
  /** Eye radius in px; callers derive it from the country's on-screen size. */
  size: number;
  mood: "neutral" | "calm" | "worried" | "angry";
  color: string;
  /** 0..1 pop-in progress. */
  appear: number;
}

export const Eyes: React.FC<EyesProps> = ({
  cx,
  cy,
  size,
  mood,
  color,
  appear,
}) => {
  const s = size * (0.6 + 0.4 * appear);
  const spacing = s * 1.25;
  const eyeRx = s * 0.62;
  const eyeRy = s * 0.78;
  const browColor = mood === "neutral" ? "#26313d" : color;
  const pupilShift = mood === "angry" ? eyeRy * 0.1 : eyeRy * 0.28;

  const eye = (ex: number) => (
    <g key={`eye-${ex}`}>
      <ellipse
        cx={ex}
        cy={cy}
        rx={eyeRx}
        ry={eyeRy}
        fill="#ffffff"
        stroke="#0d1117"
        strokeWidth={Math.max(s * 0.09, 1)}
      />
      <circle cx={ex} cy={cy + pupilShift} r={eyeRy * 0.42} fill="#10161d" />
      <circle
        cx={ex - eyeRx * 0.22}
        cy={cy + pupilShift - eyeRy * 0.18}
        r={eyeRy * 0.13}
        fill="#ffffff"
        opacity={0.9}
      />
    </g>
  );

  const brow = (ex: number, side: "left" | "right") => {
    const outerX = side === "left" ? ex - eyeRx * 1.15 : ex + eyeRx * 1.15;
    const innerX = side === "left" ? ex + eyeRx * 0.95 : ex - eyeRx * 0.95;
    const width = Math.max(s * 0.26, 1.5);

    if (mood === "angry") {
      // Slanted brows driving down toward the nose bridge.
      return (
        <line
          key={`brow-${ex}`}
          x1={outerX}
          y1={cy - eyeRy * 0.75}
          x2={innerX}
          y2={cy - eyeRy * 1.6}
          stroke={browColor}
          strokeWidth={width}
          strokeLinecap="round"
        />
      );
    }

    if (mood === "worried") {
      // Inner ends lifted — the classic "uh oh" brow.
      return (
        <line
          key={`brow-${ex}`}
          x1={outerX}
          y1={cy - eyeRy * 1.55}
          x2={innerX}
          y2={cy - eyeRy * 0.95}
          stroke={browColor}
          strokeWidth={width}
          strokeLinecap="round"
        />
      );
    }

    return (
      <path
        key={`brow-${ex}`}
        d={`M ${ex - eyeRx} ${cy - eyeRy * 1.15} Q ${ex} ${
          cy - eyeRy * 1.75
        } ${ex + eyeRx} ${cy - eyeRy * 1.15}`}
        fill="none"
        stroke={browColor}
        strokeWidth={width * 0.85}
        strokeLinecap="round"
      />
    );
  };

  return (
    <g opacity={Math.min(appear * 2.5, 1)}>
      {eye(cx - spacing)}
      {eye(cx + spacing)}
      {brow(cx - spacing, "left")}
      {brow(cx + spacing, "right")}
    </g>
  );
};
