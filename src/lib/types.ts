export type CategoryKey = string;

export interface CategoryDef {
  label: string;
  color: string;
  /**
   * Controls the cartoon eyes drawn on the currently-focused country once it
   * lands in this category. "angry" = slanted red eyebrows (e.g. banned /
   * prohibited categories), "calm" = soft rounded eyebrows (default).
   */
  mood?: "angry" | "calm";
}

export interface VideoConfig {
  id: string;
  title: string;
  /**
   * Which part of the world to frame the camera on.
   * "world" shows every country. Any other value is matched against each
   * country's `region` or `subregion` (see data/countries.generated.json),
   * e.g. "South America", "Europe", "Africa".
   */
  region: string;
  /** The two (or more) buckets a country can fall into. */
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
  timing: {
    fps: number;
    introSeconds: number;
    perCountrySeconds: number;
    outroSeconds: number;
  };
}
