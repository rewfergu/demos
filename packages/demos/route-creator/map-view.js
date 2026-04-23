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

const ROUTE_SOURCE_ID = 'rc-route';
const ROUTE_LAYER_ID = 'rc-route-line';
const EMPTY_LINE = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [] },
};

export function initRoute(map) {
  const setup = () => {
    if (map.getSource(ROUTE_SOURCE_ID)) return;
    map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: EMPTY_LINE });
    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#2563eb', 'line-width': 4, 'line-opacity': 0.85 },
    });
  };
  if (map.isStyleLoaded()) setup();
  else map.once('load', setup);
}

export function createRouteRenderer(map) {
  let markers = [];

  const render = (waypoints) => {
    markers.forEach((m) => m.remove());
    markers = [];

    const source = map.getSource(ROUTE_SOURCE_ID);
    const data = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: waypoints.map((w) => [w.lng, w.lat]),
      },
    };
    if (source) source.setData(data);
    else map.once('load', () => map.getSource(ROUTE_SOURCE_ID)?.setData(data));

    waypoints.forEach((w, i) => {
      const el = document.createElement('div');
      el.className = 'rc-waypoint-marker';
      el.textContent = String(i + 1);

      const content = document.createElement('div');
      content.className = 'marker-popup';
      const img = document.createElement('img');
      img.src = w.photoDataUrl;
      img.alt = w.name;
      const h3 = document.createElement('h3');
      h3.textContent = `${i + 1}. ${w.name}`;
      content.append(img, h3);
      if (w.description) {
        const p = document.createElement('p');
        p.textContent = w.description;
        content.append(p);
      }

      const popup = new maplibregl.Popup({ offset: 20, maxWidth: '280px' }).setDOMContent(content);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([w.lng, w.lat])
        .setPopup(popup)
        .addTo(map);
      markers.push(marker);
    });

    if (waypoints.length >= 2) {
      const bounds = new maplibregl.LngLatBounds();
      waypoints.forEach((w) => bounds.extend([w.lng, w.lat]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 600 });
    } else if (waypoints.length === 1) {
      map.flyTo({ center: [waypoints[0].lng, waypoints[0].lat], zoom: 13 });
    }
  };

  return { render };
}
