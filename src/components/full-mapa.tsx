'use client';

import { useShowInfos } from '~/hooks/use-show-infos';

import { Polygon } from './polygon';

export function FullMapa() {
  const { fullMap } = useShowInfos();

  return (
    <Polygon
      key="full-map"
      editor=""
      paths={fullMap}
      strokeColor={'red'}
      strokeOpacity={0.5}
      fillOpacity={0.0}
      territorio={-1}
    />
  );
}
