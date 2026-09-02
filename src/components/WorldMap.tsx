import React, { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
// @ts-expect-error - no type declarations shipped for this JSON package
import worldTopo from "world-atlas/countries-110m.json";
import { ccn3ToCca3, matchesRegion } from "../lib/countries";

interface CountryFeature {
  id: string;
  cca3?: string;
  geometry: unknown;
}

interface WorldMapProps {
  region: string;
  width: number;
  height: number;
  colorForCca3: (cca3: string) => string;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  region,
  width,
  height,
  colorForCca3,
}) => {
  const { paths } = useMemo(() => {
    const topoObjects = (worldTopo as { objects: Record<string, unknown> })
      .objects;
    const geo = feature(
      worldTopo as never,
      topoObjects.countries as never
      // topojson-client's types are loose; this returns a FeatureCollection.
    ) as unknown as { features: Array<{ id: string; geometry: unknown }> };

    const withCca3: CountryFeature[] = geo.features.map((f) => ({
      ...f,
      cca3: ccn3ToCca3(String(f.id)),
    }));

    const inRegion =
      region.toLowerCase() === "world"
        ? withCca3
        : withCca3.filter((f) => f.cca3 && matchesRegion(f.cca3, region));

    const fitFeatures = inRegion.length > 0 ? inRegion : withCca3;

    const projection = geoMercator().fitSize(
      [width, height],
      { type: "FeatureCollection", features: fitFeatures } as never
    );
    const path = geoPath(projection);

    return {
      paths: withCca3.map((f) => ({
        cca3: f.cca3,
        d: path(f as never) || "",
      })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, width, height]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x={0} y={0} width={width} height={height} fill="#1f4e79" />
      {paths.map(({ cca3, d }, i) =>
        d ? (
          <path
            key={cca3 ?? i}
            d={d}
            fill={cca3 ? colorForCca3(cca3) : "#3a3a3a"}
            stroke="#0d1117"
            strokeWidth={0.6}
          />
        ) : null
      )}
    </svg>
  );
};
