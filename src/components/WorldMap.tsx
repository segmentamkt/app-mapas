import React, { useMemo } from "react";
import { geoMercator, geoPath, GeoPath } from "d3-geo";
import { feature } from "topojson-client";
import { staticFile } from "remotion";
import worldTopo from "world-atlas/countries-110m.json";
import { ccn3ToCca3, matchesRegion, getCountry } from "../lib/countries";
import { VideoConfig } from "../lib/types";
import { focusStateAt, revealedCountAt } from "../lib/timeline";
import {
  LonLatBox,
  WORLD_BOX,
  boxToPolygonFeature,
  lerpBox,
  mainlandBox,
  padBox,
  safeFeatureBox,
  unionBoxes,
} from "../lib/camera";
import { Eyes } from "./Eyes";

// Antarctica is in the topojson but its landmass at extreme southern
// latitudes forces Mercator to zoom out until every other country looks
// tiny, so it is dropped rather than rendered.
const EXCLUDED_CCA3 = new Set(["ATA"]);

interface CountryFeature {
  id: string;
  cca3?: string;
  geometry: GeoJSON.Geometry;
}

interface WorldMapProps {
  config: VideoConfig;
  frame: number;
  width: number;
  height: number;
}

const PADDING_PX = 20;
const OCEAN = "#0f304a";
const LAND_UNCLASSIFIED = "#33506a";
const BORDER = "#0b1620";

export const WorldMap: React.FC<WorldMapProps> = ({
  config,
  frame,
  width,
  height,
}) => {
  const isWorld = config.region.toLowerCase() === "world";
  const cameraMode = config.cameraMode ?? "zoom";

  const { features, featureByCca3, regionBox, keyframeBoxes } = useMemo(() => {
    const topoObjects = (worldTopo as { objects: Record<string, unknown> })
      .objects;
    const geo = feature(
      worldTopo as never,
      topoObjects.countries as never
    ) as unknown as {
      features: Array<{ id: string; geometry: GeoJSON.Geometry }>;
    };

    const withCca3: CountryFeature[] = geo.features
      .map((f) => ({ ...f, cca3: ccn3ToCca3(String(f.id)) }))
      .filter((f) => !f.cca3 || !EXCLUDED_CCA3.has(f.cca3));

    const inRegion = isWorld
      ? withCca3
      : withCca3.filter((f) => f.cca3 && matchesRegion(f.cca3, config.region));

    const fitFeatures = inRegion.length > 0 ? inRegion : withCca3;
    const regionBox: LonLatBox = isWorld
      ? WORLD_BOX
      : unionBoxes(fitFeatures.map((f) => safeFeatureBox(f)));

    const featureByCca3 = new Map<string, CountryFeature>();
    for (const f of withCca3) if (f.cca3) featureByCca3.set(f.cca3, f);

    // keyframeBoxes[0] = the establishing shot; keyframeBoxes[i] (i>=1) is
    // where the camera lands when revealOrder[i-1] reveals.
    const keyframeBoxes: LonLatBox[] = [regionBox];
    for (const cca3 of config.revealOrder) {
      const f = featureByCca3.get(cca3);
      if (!f) {
        keyframeBoxes.push(regionBox);
        continue;
      }
      const zoom = config.scenes?.[cca3]?.zoom ?? 1;
      keyframeBoxes.push(padBox(mainlandBox(f), 2.4 / zoom, 9, 120, 65));
    }

    return { features: withCca3, featureByCca3, regionBox, keyframeBoxes };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.region, config.revealOrder, config.scenes, isWorld]);

  const focus = focusStateAt(config, frame);
  const revealedSet = useMemo(
    () => new Set(config.revealOrder.slice(0, revealedCountAt(config, frame))),
    [config, frame]
  );

  const camBox = useMemo(() => {
    if (cameraMode === "static" || focus.index < 0) return regionBox;
    return lerpBox(
      keyframeBoxes[focus.index],
      keyframeBoxes[focus.index + 1],
      focus.travelT
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraMode, keyframeBoxes, focus.index, focus.travelT]);

  const path = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [PADDING_PX, PADDING_PX],
        [width - PADDING_PX, height - PADDING_PX],
      ],
      boxToPolygonFeature(camBox) as never
    );
    return geoPath(projection) as GeoPath;
  }, [camBox, width, height]);

  // Eyes ride on the country currently in focus, sized from how big it
  // actually is on screen so they never dwarf or vanish inside it.
  const showEyes = config.showEyes ?? true;
  const focusFeature = focus.cca3 ? featureByCca3.get(focus.cca3) : undefined;
  const eyes = useMemo(() => {
    if (!showEyes || !focusFeature || cameraMode === "static") return null;
    const [[bx0, by0], [bx1, by1]] = path.bounds(focusFeature as never);
    const bw = bx1 - bx0;
    const bh = by1 - by0;
    if (!Number.isFinite(bw) || !Number.isFinite(bh) || bw < 24 || bh < 24)
      return null;

    const [cx, cy] = path.centroid(focusFeature as never);
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;

    const size = Math.max(Math.min(Math.min(bw, bh) * 0.16, 54), 11);
    const category = focus.cca3 ? config.countries[focus.cca3] : undefined;
    const def = category ? config.categories[category] : undefined;
    return {
      cx,
      cy: cy - size * 0.2,
      size,
      mood: focus.landed ? def?.mood ?? "calm" : ("neutral" as const),
      color: def?.color ?? "#9fb4c7",
      appear: focus.landed ? Math.min(focus.landT * 4, 1) : focus.travelT,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEyes, focusFeature, path, focus.landed, focus.landT, focus.travelT, cameraMode]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <radialGradient id="oceanGlow" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#164866" />
          <stop offset="100%" stopColor={OCEAN} />
        </radialGradient>
        <filter id="focusGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="7"
            floodColor="#ffffff"
            floodOpacity="0.55"
          />
        </filter>
      </defs>

      <rect x={0} y={0} width={width} height={height} fill="url(#oceanGlow)" />

      {features.map((f, i) => {
        const d = path(f as never) || "";
        if (!d) return null;
        const cca3 = f.cca3;
        const category = cca3 ? config.countries[cca3] : undefined;
        const isRevealed = cca3 !== undefined && revealedSet.has(cca3);
        const info = cca3 ? getCountry(cca3) : undefined;
        const isFocus = cca3 !== undefined && cca3 === focus.cca3;

        if (!category) {
          return (
            <path
              key={cca3 ?? i}
              d={d}
              fill={LAND_UNCLASSIFIED}
              stroke={BORDER}
              strokeWidth={0.6}
            />
          );
        }

        if (!isRevealed || !info) {
          return (
            <path
              key={cca3}
              d={d}
              fill={config.neutralColor}
              stroke={BORDER}
              strokeWidth={isFocus ? 1.4 : 0.7}
            />
          );
        }

        const [[bx0, by0], [bx1, by1]] = path.bounds(f as never);
        const bw = Math.max(bx1 - bx0, 1);
        const bh = Math.max(by1 - by0, 1);
        const clipId = `clip-${cca3}`;
        const def = config.categories[category];

        return (
          <g key={cca3} filter={isFocus ? "url(#focusGlow)" : undefined}>
            <clipPath id={clipId}>
              <path d={d} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              {/* A nested <svg> with its own viewBox handles "cover" cropping
                  far more reliably across renderers than preserveAspectRatio
                  on an <image> pointing at another SVG (which left tall,
                  narrow countries like Chile only partly covered). */}
              <svg
                x={bx0}
                y={by0}
                width={bw}
                height={bh}
                viewBox="0 0 640 480"
                preserveAspectRatio="xMidYMid slice"
              >
                <image
                  href={staticFile(`flags/${info.cca2.toLowerCase()}.svg`)}
                  x={0}
                  y={0}
                  width={640}
                  height={480}
                />
              </svg>
            </g>
            <path
              d={d}
              fill="none"
              stroke={isFocus ? def.color : BORDER}
              strokeWidth={isFocus ? 2.2 : 0.8}
            />
          </g>
        );
      })}

      {eyes && (
        <Eyes
          cx={eyes.cx}
          cy={eyes.cy}
          size={eyes.size}
          mood={eyes.mood}
          color={eyes.color}
          appear={eyes.appear}
        />
      )}
    </svg>
  );
};
