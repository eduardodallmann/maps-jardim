import { getTerritorios } from '~/infra/sheet';

export async function GET() {
  return Response.json(await getTerritorios());
}
