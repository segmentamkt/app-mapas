import React from "react";
import { VideoConfig } from "../lib/types";
import { revealedCountAt } from "../lib/timeline";
import { getCountry } from "../lib/countries";

interface Props {
  config: VideoConfig;
  frame: number;
  maxRows?: number;
}

export const Sidebar: React.FC<Props> = ({ config, frame, maxRows = 8 }) => {
  const revealedCount = revealedCountAt(config, frame);
  // Show the last `maxRows` revealed countries, most recent on top.
  const start = Math.max(0, revealedCount - maxRows);
  const visible = config.revealOrder.slice(start, revealedCount).reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {visible.map((cca3, idx) => {
          const info = getCountry(cca3);
          const categoryKey = config.countries[cca3];
          const def = config.categories[categoryKey];
          return (
            <div
              key={cca3}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#0f2d4a",
                border: "2px solid #0d1117",
                borderRadius: 10,
                padding: "8px 12px",
                opacity: Math.max(1 - idx * 0.12, 0.4),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>{info?.flag ?? "🏳️"}</span>
                <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
                  {info?.nameEs ?? cca3}
                </span>
              </div>
              <span
                style={{
                  background: def?.color ?? "#666",
                  color: "#111",
                  fontWeight: 900,
                  fontSize: 12,
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                {def?.label ?? ""}
              </span>
            </div>
          );
        })}
    </div>
  );
};
