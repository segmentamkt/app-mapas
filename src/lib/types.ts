export type CategoryKey = string;

export interface CategoryDef {
  label: string;
  color: string;
  /**
   * Controls the cartoon eyes drawn on the currently-focused country once it
   * lands in this category. "angry" = slanted brows (banned / prohibited /
   * high-risk categories), "worried" = raised inner brows, "calm" = soft
   * rounded brows (default).
   */
  mood?: "angry" | "worried" | "calm";
}

/** Optional per-country overrides for pacing and framing. */
export interface SceneOverride {
  /** Seconds this country's scene lasts (defaults to timing.perCountrySeconds). */
  seconds?: number;
  /**
   * How tight the camera closes in, relative to the default framing.
   * >1 zooms in (2 = twice as close), <1 pulls back.
   */
  zoom?: number;
}

export interface VideoConfig {
  id: string;
  title: string;
  /** Optional smaller line under the title (source, date, caveat). */
  subtitle?: string;
  /**
   * Which part of the world to frame the camera on.
   * "world" shows every country. Any other value is matched against each
   * country's `region` or `subregion` (see data/countries.generated.json),
   * e.g. "South America", "Europe", "Africa".
   */
  region: string;
  /**
   * "zoom" (default) travels and zooms into each country as it is revealed.
   * "static" holds one fixed view of the whole region for the entire video.
   */
  cameraMode?: "zoom" | "static";
  /** Draw cartoon eyes on the country currently in focus. Defaults to true. */
  showEyes?: boolean;
  /** The buckets a country can fall into (2 or more are supported). */
  categories: Record<CategoryKey, CategoryDef>;
  /** Category shown for a country before it has been revealed. */
  neutralColor: string;
  /** cca3 -> category assignment for every country that should be classified. */
  countries: Record<string, CategoryKey>;
  /**
   * Order in which countries get revealed/colored during the animation.
   * Every key must also exist in `countries`. Countries not listed here are
   * never revealed (map stays neutral for them, they're excluded from the
   * sidebar/progress bar).
   */
  revealOrder: string[];
  /** Optional per-country pacing/framing overrides, keyed by cca3. */
  scenes?: Record<string, SceneOverride>;
  timing: {
    fps: number;
    introSeconds: number;
    perCountrySeconds: number;
    outroSeconds: number;
  };
}
