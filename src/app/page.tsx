'use server';

import { MyMap } from '~/components/map';
import { ShowInfosProvider } from '~/context/show-infos';
import {
  getFullMap,
  getStreetsData,
  getTerritorios,
  writeCoordinates,
} from '~/infra/sheet';

export default async function Home() {
  const apiKey = process.env.API_KEY || '';
  const data = getStreetsData();
  const fullMap = getFullMap();
  const territorios = getTerritorios();

  return (
    <ShowInfosProvider
      data={data}
      fullMap={fullMap}
      territorios={territorios}
      saveCoords={writeCoordinates}
    >
      <MyMap mapApiKey={apiKey} />
    </ShowInfosProvider>
  );
}
