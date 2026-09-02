import React from "react";
import { VideoConfig } from "../lib/types";
import { tallyAt } from "../lib/timeline";

interface Props {
  config: VideoConfig;
  frame: number;
}

export const Counters: React.FC<Props> = ({ config, frame }) => {
  const { counts } = tallyAt(config, frame);

  return (
    <div style={{ display: "flex", gap: 48 }}>
      {Object.entries(config.categories).map(([key, def]) => (
        <div key={key} style={{ textAlign: "center" }}>
          <div
            style={{
              color: def.color,
              fontWeight: 900,
              fontSize: 56,
              lineHeight: 1,
              textShadow: "0 3px 0 #0d1117",
            }}
          >
            {counts[key] ?? 0}
          </div>
          <div
            style={{
              color: def.color,
              fontWeight: 700,
              fontSize: 16,
              marginTop: 4,
            }}
          >
            {def.label}
          </div>
        </div>
      ))}
    </div>
  );
};
