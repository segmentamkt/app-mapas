import { VideoConfig } from "./types";

export function durationInFrames(config: VideoConfig): number {
  const { fps, introSeconds, perCountrySeconds, outroSeconds } =
    config.timing;
  const revealSeconds = config.revealOrder.length * perCountrySeconds;
  return Math.round(fps * (introSeconds + revealSeconds + outroSeconds));
}

/** How many countries in `revealOrder` should be shown as revealed at `frame`. */
export function revealedCountAt(config: VideoConfig, frame: number): number {
  const { fps, introSeconds, perCountrySeconds } = config.timing;
  const seconds = frame / fps - introSeconds;
  if (seconds < 0) return 0;
  const count = Math.floor(seconds / perCountrySeconds) + 1;
  return Math.min(Math.max(count, 0), config.revealOrder.length);
}

export interface Tally {
  counts: Record<string, number>;
  total: number;
}

export function tallyAt(config: VideoConfig, frame: number): Tally {
  const revealed = config.revealOrder.slice(0, revealedCountAt(config, frame));
  const counts: Record<string, number> = {};
  for (const key of Object.keys(config.categories)) counts[key] = 0;
  for (const cca3 of revealed) {
    const cat = config.countries[cca3];
    if (cat) counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return { counts, total: revealed.length };
}
