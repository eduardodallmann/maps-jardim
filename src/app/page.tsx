'use server';

import { MyMap } from '~/components/map';
import { ShowInfosProvider } from '~/context/show-infos';
import { getFullMap, getStreetsData, writeCoordinates } from '~/infra/sheet';

export default async function Home() {
  const apiKey = process.env.API_KEY || '';
  const data = getStreetsData();
  const fullMap = getFullMap();

  return (
    <ShowInfosProvider
      data={data}
      fullMap={fullMap}
      saveCoords={writeCoordinates}
    >
      <MyMap mapApiKey={apiKey} />
    </ShowInfosProvider>
  );
}
