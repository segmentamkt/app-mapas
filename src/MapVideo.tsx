import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { VideoConfig } from "./lib/types";
import { WorldMap } from "./components/WorldMap";
import { ProgressBar } from "./components/ProgressBar";
import { Sidebar } from "./components/Sidebar";

const FONT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif";

export const MapVideo: React.FC<{ config: VideoConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sidebarWidth = Math.round(width * 0.23);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1c2b", fontFamily: FONT }}>
      {/* The map is the whole canvas; everything else floats over it. */}
      <WorldMap config={config} frame={frame} width={width} height={height} />

      <div
        style={{
          position: "absolute",
          top: 22,
          left: 26,
          right: sidebarWidth + 48,
        }}
      >
        <ProgressBar config={config} frame={frame} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 22,
          right: 26,
          width: sidebarWidth,
        }}
      >
        <Sidebar config={config} frame={frame} />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 34,
          left: 30,
          maxWidth: width - sidebarWidth - 90,
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 54,
            fontWeight: 900,
            lineHeight: 1.03,
            letterSpacing: -0.5,
            // Titles can use "\n" in the config to control line breaks.
            whiteSpace: "pre-line",
            textShadow:
              "4px 4px 0 #08131d, -2px -2px 0 #08131d, 2px -2px 0 #08131d, -2px 2px 0 #08131d, 0 8px 26px rgba(0,0,0,0.75)",
          }}
        >
          {config.title}
        </div>
        {config.subtitle && (
          <div
            style={{
              marginTop: 12,
              color: "#bcd3e6",
              fontSize: 19,
              fontWeight: 700,
              fontFamily: "Arial, Helvetica, sans-serif",
              textShadow: "0 3px 12px rgba(0,0,0,0.9)",
            }}
          >
            {config.subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
