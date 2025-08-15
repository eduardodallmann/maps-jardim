'use client';

import React from 'react';

import { APIProvider, Map } from '@vis.gl/react-google-maps';

import { useShowInfos } from '~/hooks/use-show-infos';

import { Clusters } from './clusters';
import { DivisaoTerritorio } from './divisao-territorio';
import { FullMapa } from './full-mapa';
import { Panel } from './panel';

const containerStyle = {
  width: '100vw',
  height: '100vh',
};

const center = {
  lat: -26.889949,
  lng: -49.261802,
};

export function MyMap({ mapApiKey }: { mapApiKey: string }) {
  const { ruas } = useShowInfos();

  return (
    <APIProvider apiKey={mapApiKey}>
      <Map
        mapId={'7b0db937b6f5c785'}
        style={containerStyle}
        defaultCenter={center}
        defaultZoom={15}
        gestureHandling={'greedy'}
        disableDefaultUI
      >
        {ruas && <Clusters />}
        <DivisaoTerritorio />
        <FullMapa />
      </Map>
      <Panel />
    </APIProvider>
  );
}
