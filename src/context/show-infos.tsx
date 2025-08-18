'use client';

import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type RefObject,
  type SetStateAction,
} from 'react';

import type {
  Coordenada,
  Counter,
  WriteCoordinatesParams,
} from '~/infra/types';

type ShowInfosContextType = {
  clientIdRef: RefObject<string | null>;
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

function somarValoresPorPoligono(
  ruas: Counter[],
  poligonos: Array<Array<Coordenada>>,
): { [nome: string]: number } {
  const somas: { [nome: string]: number } = {};

  for (const nomePoligono in poligonos) {
    const poligono = poligonos[nomePoligono];
    somas[nomePoligono] = 0;

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
  saveCoords,
  children,
}: PropsWithChildren<{
  data: Promise<Array<Counter>>;
  fullMap: Promise<Array<Coordenada>>;
  saveCoords: (coords: WriteCoordinatesParams) => Promise<void>;
}>) => {
  const [data, setData] = useState<Array<Counter>>([]);
  const [fullMap, setFullMap] = useState<Array<Coordenada>>([]);

  const [ruas, setRuas] = useState<boolean>(false);
  const [territorios, setTerritorios] = useState<Array<Array<Coordenada>>>([]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef<string | null>(null);

  const somasPorPoligono = useMemo(() => {
    return somarValoresPorPoligono(data, territorios);
  }, [data, territorios]);

  function fetchTerritorios() {
    fetch('/api/territorios')
      .then((response) => response.json())
      .then(setTerritorios);
  }

  useEffect(() => {
    dataPromise.then(setData);
    fullMapPromise.then(setFullMap);
    fetchTerritorios();
  }, []);

  useEffect(() => {
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource('/api/sse');
      eventSourceRef.current = eventSource;

      eventSource.onerror = (e) => {
        console.error('Error:', e);
        setTimeout(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            connectSSE();
          }
        }, 3000);
      };

      eventSource.addEventListener('connected', (e) => {
        const data = JSON.parse(e.data);
        console.info(data);

        clientIdRef.current = data.connectionId;
      });

      eventSource.addEventListener('reload', (e) => {
        const data = JSON.parse(e.data);
        console.info(data);

        if (data.originId !== clientIdRef.current) {
          fetchTerritorios();
        }
      });
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <ShowInfosContext.Provider
      value={{
        clientIdRef,
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
