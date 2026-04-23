import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const mapStyle = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function initMap(containerId) {
  const map = new maplibregl.Map({
    container: containerId,
    style: mapStyle,
    center: [0, 20],
    zoom: 2,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  return map;
}

export function addMarker(map, entry) {
  const popupHtml = `
    <div class="marker-popup">
      <img src="${entry.photoDataUrl}" alt="${entry.name}" />
      <h3>${entry.name}</h3>
      <p>${entry.description}</p>
    </div>
  `;

  const popup = new maplibregl.Popup({ offset: 25, maxWidth: '280px' }).setHTML(popupHtml);

  new maplibregl.Marker({ color: '#e74c3c' })
    .setLngLat([entry.lng, entry.lat])
    .setPopup(popup)
    .addTo(map);
}

export function createPreviewMarker(map, onDragEnd) {
  const marker = new maplibregl.Marker({ color: '#3b82f6', draggable: true });
  marker.on('dragend', () => {
    const { lng, lat } = marker.getLngLat();
    onDragEnd(lng, lat);
  });
  let attached = false;
  return {
    set(lng, lat) {
      marker.setLngLat([lng, lat]);
      if (!attached) {
        marker.addTo(map);
        attached = true;
      }
    },
    clear() {
      if (attached) {
        marker.remove();
        attached = false;
      }
    },
  };
}

export function loadMarkers(map, entries) {
  if (entries.length === 0) return;

  entries.forEach((entry) => addMarker(map, entry));

  if (entries.length === 1) {
    map.flyTo({ center: [entries[0].lng, entries[0].lat], zoom: 12 });
  } else {
    const bounds = new maplibregl.LngLatBounds();
    entries.forEach((entry) => bounds.extend([entry.lng, entry.lat]));
    map.fitBounds(bounds, { padding: 60 });
  }
}
