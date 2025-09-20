'use client';

import { useShowInfos } from '~/hooks/use-show-infos';
import { polygonColors } from '~/styles/map-colors';

import { Polygon } from './polygon';
import { PolygonLabel } from './polygon-label';

export function DivisaoTerritorio() {
  const { territorios } = useShowInfos();

  // Função para calcular o centroide de um polígono simples
  // Centroide geométrico (centro de massa) do polígono
  function getCentroid(
    path: {
      lat: number;
      lng: number;
    }[],
  ): {
    lat: number;
    lng: number;
  } {
    if (!path || path.length === 0) {
      return { lat: 0, lng: 0 };
    }
    let area = 0;
    let cx = 0;
    let cy = 0;
    const n = path.length;
    for (let i = 0; i < n; i++) {
      const { lat: x0, lng: y0 } = path[i];
      const { lat: x1, lng: y1 } = path[(i + 1) % n];
      const a = x0 * y1 - x1 * y0;
      area += a;
      cx += (x0 + x1) * a;
      cy += (y0 + y1) * a;
    }
    area *= 0.5;
    if (area === 0) {
      return { lat: path[0].lat, lng: path[0].lng };
    }
    cx /= 6 * area;
    cy /= 6 * area;

    return { lat: cx, lng: cy };
  }

  return (
    <>
      {territorios.map((item, key) => {
        const centroid = getCentroid(item);

        return [
          <Polygon
            key={key}
            editable={false}
            editor="editable"
            paths={item}
            fillColor={polygonColors[key].fillColor}
            strokeColor={polygonColors[key].strokeColor}
            strokeOpacity={0.6}
            fillOpacity={0.2}
            territorio={key}
          />,
          <PolygonLabel
            key={`label-${key}`}
            position={centroid}
            label={String(key + 1)}
          />,
        ];
      })}
    </>
  );
}
