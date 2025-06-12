import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

var map = L.map('map').setView([44.967243, -103.771556], 8);
map.dragging.disable();
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var marker = L.marker([44.967243, -103.771556]).addTo(map);

var circle = L.circle([45.967243, -103], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
  radius: 5000,
}).addTo(map);

var polygon = L.polygon([
  [45.967243, -102],
  [45.503, -102.5],
  [45.51, -101],
]).addTo(map);

var polyline = L.polyline([
  [43.967243, -102],
  [43.603, -101.5],
  [43.51, -101],
]).addTo(map);

marker.bindPopup('<b>Hello world!</b><br>I am a popup.').openPopup();
circle.bindPopup('I am a circle.');
polygon.bindPopup('I am a polygon.');
