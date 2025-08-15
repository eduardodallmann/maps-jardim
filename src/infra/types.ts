export type Counter = {
  key: string;
  value: number;
  lat: number;
  lng: number;
};

export type WriteCoordinatesParams = {
  sheetName: string;
  territorio: number;
  values: Array<{ lat: number; lng: number }>;
};
