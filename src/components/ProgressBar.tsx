import React from "react";
import { VideoConfig } from "../lib/types";
import { tallyAt } from "../lib/timeline";

interface Props {
  config: VideoConfig;
  frame: number;
}

/**
 * Counter chips on the left, a segmented bar in the middle, "landed / total"
 * on the right. Works with any number of categories, unlike a two-sided
 * "VS" bar.
 */
export const ProgressBar: React.FC<Props> = ({ config, frame }) => {
  const { counts, total } = tallyAt(config, frame);
  const keys = Object.keys(config.categories);
  const target = config.revealOrder.length;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        background: "rgba(8, 20, 31, 0.82)",
        border: "2px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        padding: "12px 18px",
      }}
    >
      <div style={{ display: "flex", gap: 16 }}>
        {keys.map((key) => {
          const def = config.categories[key];
          return (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 7 }}
            >
              <span
                style={{
                  color: def.color,
                  fontSize: 30,
                  fontWeight: 900,
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {counts[key] ?? 0}
              </span>
              <span
                style={{
                  color: def.color,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 0.6,
                  opacity: 0.95,
                }}
              >
                {def.label}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          height: 26,
          borderRadius: 13,
          overflow: "hidden",
          display: "flex",
          background: "rgba(255,255,255,0.07)",
          border: "2px solid rgba(0,0,0,0.45)",
        }}
      >
        {keys.map((key) => {
          const pct = target > 0 ? ((counts[key] ?? 0) / target) * 100 : 0;
          if (pct <= 0) return null;
          return (
            <div
              key={key}
              style={{
                width: `${pct}%`,
                background: config.categories[key].color,
                boxShadow: "inset 0 -3px 0 rgba(0,0,0,0.22)",
              }}
            />
          );
        })}
      </div>

      <span
        style={{
          color: "#e8f1f8",
          fontSize: 20,
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
          minWidth: 74,
          textAlign: "right",
        }}
      >
        {total} / {target}
      </span>
    </div>
  );
};
