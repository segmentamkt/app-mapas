import { VideoConfig } from "./types";

/**
 * Portion of each per-country window spent panning/zooming the camera
 * toward the next country before it "lands" (reveals its color/flag and
 * gets its mood-colored eyes). The remaining portion is a hold/dwell so the
 * viewer has time to read it before the camera moves on.
 */
export const TRAVEL_FRACTION = 0.45;

export function durationInFrames(config: VideoConfig): number {
  const { fps, introSeconds, perCountrySeconds, outroSeconds } =
    config.timing;
  const revealSeconds = config.revealOrder.length * perCountrySeconds;
  return Math.round(fps * (introSeconds + revealSeconds + outroSeconds));
}

/**
 * Continuous "how many country-slots have elapsed" value, in [0, N].
 * 0 = still in the intro, N = every country in revealOrder has landed.
 */
export function revealProgress(config: VideoConfig, frame: number): number {
  const { fps, introSeconds, perCountrySeconds } = config.timing;
  const seconds = frame / fps - introSeconds;
  const raw = seconds / perCountrySeconds;
  return Math.max(0, Math.min(raw, config.revealOrder.length));
}

/** How many countries in `revealOrder` have landed (colored/flagged) at `frame`. */
export function revealedCountAt(config: VideoConfig, frame: number): number {
  const progress = revealProgress(config, frame);
  const n = config.revealOrder.length;
  return Math.max(0, Math.min(Math.floor(progress - TRAVEL_FRACTION) + 1, n));
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

export interface FocusState {
  /** cca3 the camera is currently panning to / resting on. */
  cca3: string | null;
  /** Index into revealOrder of the focused country. */
  index: number;
  /** 0..1 eased progress of the camera travel toward this country. */
  travelT: number;
  /** True once the country has landed (past the travel phase). */
  landed: boolean;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function focusStateAt(config: VideoConfig, frame: number): FocusState {
  const n = config.revealOrder.length;
  if (n === 0) return { cca3: null, index: -1, travelT: 1, landed: true };

  const progress = revealProgress(config, frame);
  const index = Math.min(Math.floor(progress), n - 1);
  const local = progress - index;
  const travelT = Math.min(local / TRAVEL_FRACTION, 1);

  return {
    cca3: config.revealOrder[index],
    index,
    travelT: easeInOutCubic(travelT),
    landed: travelT >= 1,
  };
}
