import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { VideoConfig } from "./lib/types";
import { WorldMap } from "./components/WorldMap";
import { ProgressBar } from "./components/ProgressBar";
import { Counters } from "./components/Counters";
import { Sidebar } from "./components/Sidebar";

export const MapVideo: React.FC<{ config: VideoConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const mapWidth = Math.round(width * 0.74);
  const mapHeight = height - 210;
  const sidebarWidth = width - mapWidth - 60;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#13324f",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 42,
            fontWeight: 900,
            textShadow: "0 3px 0 #0d1117",
          }}
        >
          {config.title}
        </div>
      </div>

      <div style={{ position: "absolute", top: 100, left: 40, right: 40 }}>
        <ProgressBar config={config} frame={frame} />
      </div>

      <div style={{ position: "absolute", top: 180, left: 20 }}>
        <WorldMap
          config={config}
          frame={frame}
          width={mapWidth}
          height={mapHeight}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 180,
          left: mapWidth + 40,
          width: sidebarWidth,
        }}
      >
        <Sidebar config={config} frame={frame} />
      </div>

      <div style={{ position: "absolute", bottom: 30, left: 40 }}>
        <Counters config={config} frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
