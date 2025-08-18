import { NextResponse } from 'next/server';

import { getTerritorios } from '~/infra/sheet';

export async function GET() {
  return NextResponse.json(await getTerritorios());
}
