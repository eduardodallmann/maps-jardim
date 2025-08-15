'use client';

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useSearchParams } from 'next/navigation';

import type {
  Counter,
  Dianteira,
  Divisao,
  WriteCoordinatesParams,
} from '~/infra/types';

type Coordenada = {
  lat: number;
  lng: number;
};

export type Version = 'old' | 'new5';

type ShowInfosContextType = {
  data: Array<Counter>;
  fullMap: Coordenada | null;
  territorios: Array<Coordenada>;
  somasPorPoligono: { [nome: number]: number };

  editable: string | null;

  ruas: boolean;
  setRuas: (show: boolean) => void;

  saveCoords: (coords: WriteCoordinatesParams) => Promise<void>;
};

export const ShowInfosContext = createContext({} as ShowInfosContextType);

function estaDentroDoPoligono(
  coordenada: Coordenada,
  poligono: Coordenada[],
): boolean {
  let dentro = false;
  let j = poligono.length - 1;

  for (let i = 0; i < poligono.length; i++) {
    const xi = poligono[i].lng,
      yi = poligono[i].lat;
    const xj = poligono[j].lng,
      yj = poligono[j].lat;

    const intersect =
      yi > coordenada.lat !== yj > coordenada.lat &&
      coordenada.lng < ((xj - xi) * (coordenada.lat - yi)) / (yj - yi) + xi;
    if (intersect) {
      dentro = !dentro;
    }
    j = i;
  }

  return dentro;
}

// Função para somar os valores das ruas dentro de cada polígono
function somarValoresPorPoligono(
  ruas: Counter[],
  poligonos: Array<Coordenada>,
): { [nome: string]: number } {
  const somas: { [nome: string]: number } = {};

  // Iterar sobre cada polígono
  for (const nomePoligono in poligonos) {
    const poligono = poligonos[nomePoligono];
    somas[nomePoligono] = 0;

    // Iterar sobre cada rua
    for (const rua of ruas) {
      if (estaDentroDoPoligono({ lat: rua.lat, lng: rua.lng }, poligono)) {
        somas[nomePoligono] += rua.value;
      }
    }
  }

  return somas;
}

export const ShowInfosProvider = ({
  data: dataPromise,
  fullMap: fullMapPromise,
  territorios: territoriosPromise,
  saveCoords,
  children,
}: PropsWithChildren<{
  data: Promise<Array<Counter>>;
  fullMap: Promise<Coordenada>;
  territorios: Promise<Array<Coordenada>>;
  saveCoords: (coords: WriteCoordinatesParams) => Promise<void>;
}>) => {
  const [data, setData] = useState<Array<Counter>>([]);
  const [fullMap, setFullMap] = useState<Coordenada | null>(null);

  const [ruas, setRuas] = useState<boolean>(false);
  const [territorios, setTerritorios] = useState<Array<Coordenada>>([]);
  const params = useSearchParams();

  const somasPorPoligono = useMemo(() => {
    return somarValoresPorPoligono(data, territorios);
  }, [data, territorios]);

  useEffect(() => {
    dataPromise.then(setData);
    fullMapPromise.then(setFullMap);
    territoriosPromise.then(setTerritorios);
  }, []);

  return (
    <ShowInfosContext.Provider
      value={{
        ruas,
        setRuas,

        data,
        fullMap,
        territorios,

        somasPorPoligono,

        editable: params.get('editable'),

        saveCoords,
      }}
    >
      {children}
    </ShowInfosContext.Provider>
  );
};
