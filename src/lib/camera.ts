import { geoArea, geoBounds, geoCentroid } from "d3-geo";

export interface LonLatBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

/** A sensible fixed world view: the whole globe, cropped to exclude
 * Antarctica (which otherwise forces Mercator to zoom out so far that
 * every other country looks tiny). */
export const WORLD_BOX: LonLatBox = {
  minLon: -180,
  maxLon: 180,
  minLat: -58,
  maxLat: 83,
};

/**
 * geoBounds() on a feature that crosses the antimeridian (Russia, Fiji,
 * some Pacific/Aleutian territories) can return a box whose "min" longitude
 * is greater than its "max" (that's d3's documented way of signaling
 * wraparound), or an implausibly wide one. Naively treating that as a
 * normal box produces a degenerate, near-empty camera window. When that
 * happens, fall back to a fixed-size window around the feature's centroid
 * instead of trusting the raw bounds.
 */
export function safeFeatureBox(f: unknown): LonLatBox {
  const [[minLon, minLat], [maxLon, maxLat]] = geoBounds(f as never);
  const wraps = minLon > maxLon || maxLon - minLon > 180;
  if (!wraps) return { minLon, minLat, maxLon, maxLat };

  const [cLon, cLat] = geoCentroid(f as never);
  return { minLon: cLon - 18, maxLon: cLon + 18, minLat: cLat - 12, maxLat: cLat + 12 };
}

/**
 * Bounds of a country's *main landmass* rather than every scrap of territory
 * it owns. Framing on the full geometry makes the camera pull back to fit
 * Alaska when zooming on the US, the Galápagos for Ecuador, Easter Island for
 * Chile, or Russia's tail across the antimeridian — so the country itself ends
 * up tiny. Picking the single largest polygon gives the framing a viewer
 * actually expects.
 */
export function mainlandBox(f: unknown): LonLatBox {
  const geometry = (f as { geometry?: { type?: string; coordinates?: unknown[] } })
    .geometry;

  if (geometry?.type === "MultiPolygon" && Array.isArray(geometry.coordinates)) {
    let best: LonLatBox | null = null;
    let bestArea = -1;

    for (const coordinates of geometry.coordinates) {
      const polygon = { type: "Polygon", coordinates } as never;
      const area = geoArea(polygon);
      if (area > bestArea) {
        bestArea = area;
        best = safeFeatureBox(polygon);
      }
    }
    if (best) return best;
  }

  return safeFeatureBox(f);
}

export function unionBoxes(boxes: LonLatBox[]): LonLatBox {
  return boxes.reduce((acc, b) => ({
    minLon: Math.min(acc.minLon, b.minLon),
    maxLon: Math.max(acc.maxLon, b.maxLon),
    minLat: Math.min(acc.minLat, b.minLat),
    maxLat: Math.max(acc.maxLat, b.maxLat),
  }));
}

export function boxToPolygonFeature(box: LonLatBox) {
  const { minLon, minLat, maxLon, maxLat } = box;
  // d3-geo treats GeoJSON polygons as spherical: the exterior ring must be
  // wound clockwise (lon increasing = right, lat increasing = up) for its
  // interior to be the small patch we mean, not the rest of the planet.
  // Going right-then-up first (the "obvious" order) is counterclockwise and
  // makes d3 treat almost the whole globe as the box's interior instead.
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [minLon, minLat],
          [minLon, maxLat],
          [maxLon, maxLat],
          [maxLon, minLat],
          [minLon, minLat],
        ],
      ],
    },
  };
}

/** Expands a box around its own center by `factor`, clamped between
 * `minSize` (so tiny countries don't zoom in to an absurd close-up) and
 * `maxLonSize`/`maxLatSize` (so huge countries — the US spans ~105° once
 * Alaska is counted — don't get padded into a window wider than the
 * planet, which would zoom out until nothing is visible). The latitude
 * cap is kept tighter than the longitude one and the result is clamped to
 * [-85, 85]: Mercator's y-coordinate blows up to infinity near the poles,
 * and an out-of-range latitude here would silently break every fitExtent
 * downstream, making the camera fall back to looking zoomed all the way
 * out. */
export function padBox(
  box: LonLatBox,
  factor: number,
  minSize: number,
  maxLonSize: number,
  maxLatSize: number
): LonLatBox {
  const cx = (box.minLon + box.maxLon) / 2;
  const cy = (box.minLat + box.maxLat) / 2;
  const w = Math.min(
    Math.max((box.maxLon - box.minLon) * factor, minSize),
    maxLonSize
  );
  const h = Math.min(
    Math.max((box.maxLat - box.minLat) * factor, minSize),
    maxLatSize
  );
  return {
    minLon: cx - w / 2,
    maxLon: cx + w / 2,
    minLat: Math.max(cy - h / 2, -85),
    maxLat: Math.min(cy + h / 2, 85),
  };
}

export function lerpBox(a: LonLatBox, b: LonLatBox, t: number): LonLatBox {
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    minLon: l(a.minLon, b.minLon),
    maxLon: l(a.maxLon, b.maxLon),
    minLat: l(a.minLat, b.minLat),
    maxLat: l(a.maxLat, b.maxLat),
  };
}
