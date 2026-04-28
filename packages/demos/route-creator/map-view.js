import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE_URL = `https://api.maptiler.com/maps/base-v4/style.json?key=${import.meta.env.PUBLIC_MAPTILER_KEY}`;

export function initMap(container) {
  const map = new maplibregl.Map({
    container,
    style: MAP_STYLE_URL,
    // center: [0, 20],
    // zoom: 8,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  navigator.geolocation?.getCurrentPosition(({ coords }) => {
    map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 12 });
  });

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

export function createRouteRenderer(map, onMarkerClick) {
  let markers = [];
  let lastWaypointKey = '';

  const render = (waypoints, activeIndex = -1) => {
    markers.forEach(m => m.remove());
    markers = [];

    const source = map.getSource(ROUTE_SOURCE_ID);
    const data = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: waypoints.map(w => [w.lng, w.lat]),
      },
    };
    if (source) source.setData(data);
    else map.once('load', () => map.getSource(ROUTE_SOURCE_ID)?.setData(data));

    waypoints.forEach((w, i) => {
      const el = document.createElement('div');
      el.className = 'rc-waypoint-marker';
      if (i === activeIndex) el.classList.add('rc-waypoint-marker-active');
      const inner = document.createElement('div');
      inner.className = 'rc-waypoint-marker-inner';
      inner.textContent = String(i + 1);
      el.appendChild(inner);

      el.addEventListener('click', e => {
        e.stopPropagation();
        onMarkerClick?.(i);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([w.lng, w.lat])
        .addTo(map);
      markers.push(marker);
    });

    const key = waypoints.map(w => `${w.id}:${w.lat}:${w.lng}`).join('|');
    const waypointsChanged = key !== lastWaypointKey;
    lastWaypointKey = key;

    if (!waypointsChanged) return;

    if (waypoints.length >= 2) {
      const bounds = new maplibregl.LngLatBounds();
      waypoints.forEach(w => bounds.extend([w.lng, w.lat]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 600 });
    } else if (waypoints.length === 1) {
      map.flyTo({ center: [waypoints[0].lng, waypoints[0].lat], zoom: 13 });
    }
  };

  const setActive = activeIndex => {
    markers.forEach((m, i) => {
      m.getElement().classList.toggle(
        'rc-waypoint-marker-active',
        i === activeIndex
      );
    });
  };

  return { render, setActive };
}
