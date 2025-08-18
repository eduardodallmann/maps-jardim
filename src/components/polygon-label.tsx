import { Marker } from '@vis.gl/react-google-maps';

export function PolygonLabel({
  position,
  label,
}: {
  position: google.maps.LatLngLiteral;
  label: string;
}) {
  return <Marker position={position} label={label} />;
}
