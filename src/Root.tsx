import React from "react";
import { Composition } from "remotion";
import { MapVideo } from "./MapVideo";
import { durationInFrames } from "./lib/timeline";
import { VideoConfig } from "./lib/types";
import demoConfig from "../data/videos/demo-south-america.json";

const typedDemoConfig = demoConfig as VideoConfig;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MapVideo"
      component={MapVideo}
      durationInFrames={durationInFrames(typedDemoConfig)}
      fps={typedDemoConfig.timing.fps}
      width={1920}
      height={1080}
      defaultProps={{ config: typedDemoConfig }}
      calculateMetadata={async ({ props }) => {
        const config = props.config as VideoConfig;
        return {
          durationInFrames: durationInFrames(config),
          fps: config.timing.fps,
        };
      }}
    />
  );
};
