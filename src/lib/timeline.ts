import { VideoConfig } from "./types";

/**
 * Portion of each scene spent panning/zooming the camera toward that country
 * before it "lands" (reveals its flag, counter and sidebar row). The rest is
 * a hold so the viewer has time to read it before the camera moves on.
 */
export const TRAVEL_FRACTION = 0.45;

export interface Scene {
  cca3: string;
  /** Index in revealOrder. */
  index: number;
  /** Frame the camera starts travelling toward this country. */
  startFrame: number;
  /** Frame the country reveals (flag fill, counter, sidebar row). */
  landFrame: number;
  /** Frame the next scene takes over. */
  endFrame: number;
  /** Camera tightness multiplier for this country (1 = default framing). */
  zoom: number;
}

/** Builds the full scene list once; every other query derives from it. */
export function buildScenes(config: VideoConfig): Scene[] {
  const { fps, introSeconds, perCountrySeconds } = config.timing;
  const scenes: Scene[] = [];
  let cursor = Math.round(introSeconds * fps);

  config.revealOrder.forEach((cca3, index) => {
    const override = config.scenes?.[cca3];
    const seconds = override?.seconds ?? perCountrySeconds;
    const frames = Math.max(Math.round(seconds * fps), 2);
    const startFrame = cursor;
    scenes.push({
      cca3,
      index,
      startFrame,
      landFrame: startFrame + Math.round(frames * TRAVEL_FRACTION),
      endFrame: startFrame + frames,
      zoom: override?.zoom ?? 1,
    });
    cursor = startFrame + frames;
  });

  return scenes;
}

export function durationInFrames(config: VideoConfig): number {
  const scenes = buildScenes(config);
  const last = scenes[scenes.length - 1];
  const tail = Math.round(config.timing.outroSeconds * config.timing.fps);
  return (last ? last.endFrame : Math.round(config.timing.introSeconds * config.timing.fps)) + tail;
}

/** How many countries have landed (are coloured in) at `frame`. */
export function revealedCountAt(config: VideoConfig, frame: number): number {
  const scenes = buildScenes(config);
  let count = 0;
  for (const scene of scenes) if (frame >= scene.landFrame) count++;
  return count;
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
  /** cca3 the camera is currently travelling toward or resting on. */
  cca3: string | null;
  /** Index into revealOrder of the focused country (-1 before any scene). */
  index: number;
  /** 0..1 eased progress of the camera travel toward this country. */
  travelT: number;
  /** True once the country has landed (past the travel phase). */
  landed: boolean;
  /** 0..1 progress since landing, for pop-in animations. */
  landT: number;
  /** Camera tightness multiplier for this scene. */
  zoom: number;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function focusStateAt(config: VideoConfig, frame: number): FocusState {
  const scenes = buildScenes(config);
  if (scenes.length === 0)
    return { cca3: null, index: -1, travelT: 1, landed: true, landT: 1, zoom: 1 };

  // The scene in progress, or the last one once the outro starts.
  let scene = scenes[scenes.length - 1];
  for (const s of scenes) {
    if (frame < s.endFrame) {
      scene = s;
      break;
    }
  }

  const travelFrames = Math.max(scene.landFrame - scene.startFrame, 1);
  const rawTravel = (frame - scene.startFrame) / travelFrames;
  const travelT = Math.min(Math.max(rawTravel, 0), 1);
  const holdFrames = Math.max(scene.endFrame - scene.landFrame, 1);
  const landT = Math.min(Math.max((frame - scene.landFrame) / holdFrames, 0), 1);

  return {
    cca3: scene.cca3,
    index: scene.index,
    travelT: easeInOutCubic(travelT),
    landed: frame >= scene.landFrame,
    landT,
    zoom: scene.zoom,
  };
}
