import React from "react";
import { VideoConfig } from "../lib/types";
import { tallyAt } from "../lib/timeline";

interface Props {
  config: VideoConfig;
  frame: number;
}

export const ProgressBar: React.FC<Props> = ({ config, frame }) => {
  const { counts, total } = tallyAt(config, frame);
  const keys = Object.keys(config.categories);
  const isBinary = keys.length === 2;

  const segments = keys.map((key) => ({
    key,
    color: config.categories[key].color,
    pct: total > 0 ? (counts[key] / total) * 100 : 100 / keys.length,
  }));

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {isBinary && (
        <Label
          text={`${config.categories[keys[0]].label} ${Math.round(
            segments[0].pct
          )}%`}
          color={config.categories[keys[0]].color}
        />
      )}
      <div
        style={{
          flex: 1,
          height: 44,
          borderRadius: 22,
          overflow: "hidden",
          display: "flex",
          border: "3px solid #0d1117",
          position: "relative",
        }}
      >
        {segments.map((s) => (
          <div
            key={s.key}
            style={{
              width: `${s.pct}%`,
              backgroundColor: s.color,
              transition: "width 0.2s linear",
            }}
          />
        ))}
        {isBinary && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#f4b400",
              color: "#111",
              fontWeight: 900,
              fontSize: 18,
              padding: "4px 10px",
              borderRadius: 8,
              border: "2px solid #0d1117",
            }}
          >
            VS
          </div>
        )}
      </div>
      {isBinary && (
        <Label
          text={`${Math.round(segments[1].pct)}% ${
            config.categories[keys[1]].label
          }`}
          color={config.categories[keys[1]].color}
        />
      )}
    </div>
  );
};

const Label: React.FC<{ text: string; color: string }> = ({
  text,
  color,
}) => (
  <span
    style={{
      color,
      fontWeight: 900,
      fontSize: 26,
      whiteSpace: "nowrap",
      textShadow: "0 2px 0 #0d1117",
    }}
  >
    {text}
  </span>
);
