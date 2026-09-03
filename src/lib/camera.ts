export interface LonLatBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export function boxToPolygonFeature(box: LonLatBox) {
  const { minLon, minLat, maxLon, maxLat } = box;
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [minLon, minLat],
          [maxLon, minLat],
          [maxLon, maxLat],
          [minLon, maxLat],
          [minLon, minLat],
        ],
      ],
    },
  };
}

/** Expands a box around its own center, enforcing a minimum size so tiny
 * countries don't zoom in to an absurd close-up. */
export function padBox(
  box: LonLatBox,
  factor: number,
  minSize: number
): LonLatBox {
  const cx = (box.minLon + box.maxLon) / 2;
  const cy = (box.minLat + box.maxLat) / 2;
  const w = Math.max((box.maxLon - box.minLon) * factor, minSize);
  const h = Math.max((box.maxLat - box.minLat) * factor, minSize);
  return {
    minLon: cx - w / 2,
    maxLon: cx + w / 2,
    minLat: cy - h / 2,
    maxLat: cy + h / 2,
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
