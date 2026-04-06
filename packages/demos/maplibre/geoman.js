import 'maplibre-gl/dist/maplibre-gl.css';
import '@geoman-io/maplibre-geoman-free/dist/maplibre-geoman.css';

import ml from 'maplibre-gl';
import { Geoman } from '@geoman-io/maplibre-geoman-free';

const addPointBtn = document.getElementById('add-point');
const addLineBtn = document.getElementById('add-line');

let pointsEnabled = false;
let linesEnabled = false;

addPointBtn.addEventListener('click', () => {
  console.log('Add point');
  pointsEnabled = !pointsEnabled;
});

addLineBtn.addEventListener('click', () => {
  console.log('Add line');
  linesEnabled = !linesEnabled;
});

const mapLibreStyle = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
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

const map = new ml.Map({
  container: 'dev-map',
  style: mapLibreStyle,
  center: [0, 51],
  zoom: 5,
});

const gmOptions = {
  // geoman options here
};

// create a new geoman instance
const geoman = new Geoman(map, gmOptions);

// callback when geoman is fully loaded
map.on('gm:loaded', () => {
  console.log('Geoman fully loaded');

  // Here you can add your geojson shapes for example
  const shapeGeoJson = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [0, 51] },
    properties: {},
  };
  // add a geojson shape to the map
  geoman.features.importGeoJsonFeature(shapeGeoJson);

  const shapeGeoJson2 = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [3, 52] },
    properties: {},
  };
  // geoman instance is also available on the map object
  map.gm?.features.importGeoJsonFeature(shapeGeoJson2);
});

geoman.setGlobalEventsListener(event => {
  if (
    event.type === 'converted' &&
    event.name === 'gm:create' &&
    event.payload.shape === 'marker'
  ) {
    console.log('Marker event:', event);
  }
});

map.on('click', e => {
  console.log('Map clicked at:', e.lngLat);
  // you can also use the geoman instance to add a marker
  // geoman.features.addMarker(e.lngLat);

  if (pointsEnabled) {
    const marker = new ml.Marker({
      color: 'red',
      draggable: true,
    })
      .setLngLat(e.lngLat)
      .addTo(map);
  }
});
