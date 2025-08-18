'use server';

import { google } from 'googleapis';

import { authenticate } from './auth';
import { broadcaster } from './broadcaster';
import { type Counter, type WriteCoordinatesParams } from './types';

export async function getStreetsData() {
  const apiKey = process.env.API_KEY;
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = 'ruas';

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`,
      { cache: 'no-store' },
    );
    const data: {
      values: Array<[string, string, string, string, string, string]>;
    } = await response.json();

    const dados: Array<Counter> = data.values
      .slice(1)
      .map(([rua, _bairro, _cidade, _cep, coordenadas, contagemCasas]) => {
        const [lat = 0, lng = 0] = (coordenadas || ',').split(',').map(Number);

        return {
          key: rua,
          value: Number(contagemCasas || 0),
          lat,
          lng,
        };
      });

    return dados;
  } catch (error) {
    console.error('Error:', error);

    return [];
  }
}

export async function getFullMap() {
  const apiKey = process.env.API_KEY;
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = 'full-map';

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`,
      { cache: 'no-store' },
    );
    const data: {
      values: Array<[string]>;
    } = await response.json();

    const dados: WriteCoordinatesParams['values'] = data.values
      .slice(1)
      .map(([coordenadas], i) => {
        const [lng = 0, lat = 0] = (coordenadas || ',').split(',').map(Number);

        return {
          key: i,
          lat,
          lng,
        };
      });

    return dados;
  } catch (error) {
    console.error('Error:', error);

    return [];
  }
}

export async function getTerritorios() {
  const apiKey = process.env.API_KEY;
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = 'coords';

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`,
      { cache: 'no-store' },
    );
    const data: {
      values: Array<
        [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      >;
    } = await response.json();

    const numLinhas = data.values[0].length;

    return Array.from({ length: numLinhas }, (_, i) =>
      data.values
        .slice(1)
        .map((coluna) => {
          const [lng = 0, lat = 0] = (coluna[i] || ',').split(',').map(Number);

          return { lng, lat };
        })
        .filter((e) => e.lat !== 0),
    );
  } catch (error) {
    console.error('Error:', error);

    return [];
  }
}

export async function writeStreetsCoordinates({
  line,
  value,
}: {
  line: string;
  value: string;
}) {
  const auth = await authenticate();

  //@ts-ignore
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = 'Ruas';

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!E${line}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[value]],
    },
  });
}

export async function writeCoordinates({
  sheetName,
  territorio,
  values,
  originId,
}: WriteCoordinatesParams) {
  const territorioColumns: Record<number, string> = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G',
    7: 'H',
    8: 'I',
    9: 'J',
    10: 'K',
    11: 'L',
    12: 'M',
    13: 'N',
    14: 'O',
    15: 'P',
    16: 'Q',
    17: 'R',
  };
  const auth = await authenticate();

  //@ts-ignore
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.SPREADSHEET_ID;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!${territorioColumns[territorio]}2`,
    valueInputOption: 'RAW',
    requestBody: {
      values: values.map(({ lat, lng }) => [`${lng},${lat}`]),
    },
  });

  broadcaster.broadcast(
    {
      command: 'reload',
      message: 'Página será recarregada devido a atualização',
      reason: 'Atualização do sistema',
      triggeredBy: 'sistema',
      timestamp: new Date().toISOString(),
      totalConnections: broadcaster.connectionCount,
      originId,
    },
    'reload',
  );
}
