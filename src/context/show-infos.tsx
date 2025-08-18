'use client';

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

import type {
  Coordenada,
  Counter,
  WriteCoordinatesParams,
} from '~/infra/types';

type ShowInfosContextType = {
  data: Array<Counter>;
  fullMap: Array<Coordenada>;
  territorios: Array<Array<Coordenada>>;
  somasPorPoligono: { [nome: number]: number };

  ruas: boolean;
  setRuas: (show: boolean) => void;

  saveCoords: (coords: WriteCoordinatesParams) => Promise<void>;
  setTerritorios: (territorios: SetStateAction<Coordenada[][]>) => void;
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
  poligonos: Array<Array<Coordenada>>,
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
  fullMap: Promise<Array<Coordenada>>;
  territorios: Promise<Array<Array<Coordenada>>>;
  saveCoords: (coords: WriteCoordinatesParams) => Promise<void>;
}>) => {
  const [data, setData] = useState<Array<Counter>>([]);
  const [fullMap, setFullMap] = useState<Array<Coordenada>>([]);

  const [ruas, setRuas] = useState<boolean>(false);
  const [territorios, setTerritorios] = useState<Array<Array<Coordenada>>>([]);

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

        saveCoords,
        setTerritorios,
      }}
    >
      {children}
    </ShowInfosContext.Provider>
  );
};
