'use client';

import { useShowInfos } from '~/hooks/use-show-infos';
import { polygonColors } from '~/styles/map-colors';

import { Polygon } from './polygon';

export function DivisaoTerritorio() {
  const { territorios } = useShowInfos();

  const maps = territorios.map((item, key) => {
    return (
      <Polygon
        key={key}
        editable
        editor={'editable'}
        paths={item}
        fillColor={polygonColors[key].fillColor}
        strokeColor={polygonColors[key].strokeColor}
        strokeOpacity={0.6}
        fillOpacity={0.2}
        territorio={key}
      />
    );
  });

  return <>{maps}</>;
}
