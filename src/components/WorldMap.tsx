import React, { useMemo } from "react";
import { geoMercator, geoPath, geoBounds, GeoPath } from "d3-geo";
import { feature } from "topojson-client";
import { staticFile } from "remotion";
import worldTopo from "world-atlas/countries-110m.json";
import { ccn3ToCca3, matchesRegion, getCountry } from "../lib/countries";
import { VideoConfig } from "../lib/types";
import { focusStateAt, revealedCountAt } from "../lib/timeline";
import { LonLatBox, boxToPolygonFeature, lerpBox, padBox } from "../lib/camera";

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

const PADDING_PX = 24;

export const WorldMap: React.FC<WorldMapProps> = ({
  config,
  frame,
  width,
  height,
}) => {
  const { features, regionBox, keyframeBoxes } = useMemo(() => {
    const topoObjects = (worldTopo as { objects: Record<string, unknown> })
      .objects;
    const geo = feature(
      worldTopo as never,
      topoObjects.countries as never
    ) as unknown as { features: Array<{ id: string; geometry: GeoJSON.Geometry }> };

    const withCca3: CountryFeature[] = geo.features.map((f) => ({
      ...f,
      cca3: ccn3ToCca3(String(f.id)),
    }));

    const inRegion =
      config.region.toLowerCase() === "world"
        ? withCca3
        : withCca3.filter((f) => f.cca3 && matchesRegion(f.cca3, config.region));

    const fitFeatures = inRegion.length > 0 ? inRegion : withCca3;
    const [[minLon, minLat], [maxLon, maxLat]] = geoBounds({
      type: "FeatureCollection",
      features: fitFeatures,
    } as never);
    const regionBox: LonLatBox = { minLon, minLat, maxLon, maxLat };

    const featureByCca3 = new Map<string, CountryFeature>();
    for (const f of withCca3) if (f.cca3) featureByCca3.set(f.cca3, f);

    // keyframeBoxes[0] = whole region; keyframeBoxes[i] (i>=1) = padded
    // bounds around revealOrder[i-1], the box the camera lands on once
    // that country reveals.
    const keyframeBoxes: LonLatBox[] = [regionBox];
    for (const cca3 of config.revealOrder) {
      const f = featureByCca3.get(cca3);
      if (!f) {
        keyframeBoxes.push(regionBox);
        continue;
      }
      const [[lo0, la0], [lo1, la1]] = geoBounds(f as never);
      keyframeBoxes.push(
        padBox({ minLon: lo0, minLat: la0, maxLon: lo1, maxLat: la1 }, 5, 8)
      );
    }

    return { features: withCca3, regionBox, keyframeBoxes, featureByCca3 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.region, config.revealOrder, config.countries]);

  const focus = focusStateAt(config, frame);
  const revealedSet = useMemo(
    () => new Set(config.revealOrder.slice(0, revealedCountAt(config, frame))),
    [config, frame]
  );

  const camBox = useMemo(() => {
    if (focus.index < 0) return regionBox;
    return lerpBox(
      keyframeBoxes[focus.index],
      keyframeBoxes[focus.index + 1],
      focus.travelT
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyframeBoxes, focus.index, focus.travelT]);

  const { projection, path } = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [PADDING_PX, PADDING_PX],
        [width - PADDING_PX, height - PADDING_PX],
      ],
      boxToPolygonFeature(camBox) as never
    );
    return { projection, path: geoPath(projection) as GeoPath };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camBox, width, height]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x={0} y={0} width={width} height={height} fill="#1f4e79" />
      {features.map((f, i) => {
        const d = path(f as never) || "";
        if (!d) return null;
        const cca3 = f.cca3;
        const category = cca3 ? config.countries[cca3] : undefined;
        const isRevealed = cca3 !== undefined && revealedSet.has(cca3);
        const info = cca3 ? getCountry(cca3) : undefined;
        const clipId = `clip-${cca3 ?? i}`;

        if (!category) {
          return (
            <path
              key={cca3 ?? i}
              d={d}
              fill="#3a3a3a"
              stroke="#0d1117"
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
              stroke="#0d1117"
              strokeWidth={0.6}
            />
          );
        }

        const [[bx0, by0], [bx1, by1]] = path.bounds(f as never);
        const bw = Math.max(bx1 - bx0, 1);
        const bh = Math.max(by1 - by0, 1);

        return (
          <g key={cca3}>
            <clipPath id={clipId}>
              <path d={d} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              <image
                href={staticFile(`flags/${info.cca2.toLowerCase()}.svg`)}
                x={bx0}
                y={by0}
                width={bw}
                height={bh}
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
            <path d={d} fill="none" stroke="#0d1117" strokeWidth={0.6} />
          </g>
        );
      })}
    </svg>
  );
};
