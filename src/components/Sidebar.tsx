import React from "react";
import { VideoConfig } from "../lib/types";
import { revealedCountAt } from "../lib/timeline";
import { getCountry } from "../lib/countries";

interface Props {
  config: VideoConfig;
  frame: number;
  maxRows?: number;
}

export const Sidebar: React.FC<Props> = ({ config, frame, maxRows = 9 }) => {
  const revealedCount = revealedCountAt(config, frame);
  // Last `maxRows` revealed countries, most recent on top.
  const start = Math.max(0, revealedCount - maxRows);
  const visible = config.revealOrder.slice(start, revealedCount).reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {visible.map((cca3, idx) => {
        const info = getCountry(cca3);
        const def = config.categories[config.countries[cca3]];
        const isNewest = idx === 0;
        const color = def?.color ?? "#7d8fa1";

        return (
          <div
            key={cca3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              // Opaque, not translucent: the map scrolls underneath and a
              // see-through card makes the country names unreadable.
              background: isNewest ? "#14344c" : "#0d2033",
              border: `2px solid ${isNewest ? color : "rgba(255,255,255,0.09)"}`,
              borderLeft: `6px solid ${color}`,
              borderRadius: 12,
              padding: "10px 12px",
              // No element-level opacity: it would make the whole card
              // translucent and let the moving map show through the text.
              // Recency is conveyed by the border and glow instead.
              boxShadow: isNewest ? `0 0 18px ${color}55` : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: 20 }}>{info?.flag ?? "🏳️"}</span>
              <span
                style={{
                  color: "#f2f7fb",
                  fontWeight: 800,
                  fontSize: 16,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {info?.nameEs ?? cca3}
              </span>
            </div>
            <span
              style={{
                background: color,
                color: "#0b1620",
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: 0.5,
                padding: "4px 8px",
                borderRadius: 6,
                whiteSpace: "nowrap",
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
