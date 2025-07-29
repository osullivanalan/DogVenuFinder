// components/map/RecenterButton.tsx
import { useMap } from 'react-leaflet';

export default function RecenterButton() {
  const map = useMap();

  const handleClick = () => {
    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      map.flyTo([coords.latitude, coords.longitude], 12, { animate: true });
    });
  };

  // Style this however you like (Tailwind, CSS module, etc.)
  return (
    <button
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1000,
        padding: '6px 10px',
        borderRadius: 4,
      }}
    >
      📍 My location
    </button>
  );
}
