import { extractGps } from './exif.js';
import { saveEntry, getAllEntries } from './store.js';
import { initMap, addMarker, loadMarkers } from './map-view.js';
import './style.css';

function resizeImage(file, maxDim = 800) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = url;
  });
}

function buildForm(container) {
  container.innerHTML = `
    <div class="pl-layout">
      <div class="pl-sidebar">
        <form class="pl-form" id="pl-form">
          <div class="pl-field">
            <label for="pl-photo">Photo</label>
            <input type="file" id="pl-photo" accept="image/*" capture="environment" required />
            <div id="pl-preview" class="pl-preview" hidden>
              <img id="pl-preview-img" alt="Preview" />
            </div>
          </div>
          <div class="pl-field pl-row">
            <div>
              <label for="pl-lat">Latitude</label>
              <input type="number" id="pl-lat" step="any" min="-90" max="90" required placeholder="e.g. 40.7128" />
            </div>
            <div>
              <label for="pl-lng">Longitude</label>
              <input type="number" id="pl-lng" step="any" min="-180" max="180" required placeholder="e.g. -74.0060" />
            </div>
          </div>
          <div class="pl-gps-status" id="pl-gps-status" hidden></div>
          <div class="pl-field">
            <label for="pl-name">Location Name</label>
            <input type="text" id="pl-name" required placeholder="e.g. Brooklyn Bridge" />
          </div>
          <div class="pl-field">
            <label for="pl-desc">Description</label>
            <textarea id="pl-desc" rows="3" placeholder="Describe this place..."></textarea>
          </div>
          <button type="submit" class="pl-submit">Add to Map</button>
        </form>
      </div>
      <div class="pl-map-wrap">
        <div id="pl-map"></div>
      </div>
    </div>
  `;
}

export async function init(containerId = 'photo-location') {
  const container = document.getElementById(containerId);
  if (!container) return;

  buildForm(container);

  const map = initMap('pl-map');

  const form = document.getElementById('pl-form');
  const photoInput = document.getElementById('pl-photo');
  const preview = document.getElementById('pl-preview');
  const previewImg = document.getElementById('pl-preview-img');
  const latInput = document.getElementById('pl-lat');
  const lngInput = document.getElementById('pl-lng');
  const gpsStatus = document.getElementById('pl-gps-status');

  let currentDataUrl = null;

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;

    currentDataUrl = await resizeImage(file);
    previewImg.src = currentDataUrl;
    preview.hidden = false;

    gpsStatus.hidden = false;
    gpsStatus.textContent = 'Reading EXIF data...';

    const gps = await extractGps(file);
    if (gps) {
      latInput.value = gps.lat.toFixed(6);
      lngInput.value = gps.lng.toFixed(6);
      gpsStatus.textContent = 'GPS coordinates extracted from photo.';
      gpsStatus.className = 'pl-gps-status pl-gps-found';
    } else {
      gpsStatus.textContent = 'No GPS data found. Enter coordinates manually.';
      gpsStatus.className = 'pl-gps-status pl-gps-missing';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentDataUrl) return;

    const entry = {
      name: document.getElementById('pl-name').value.trim(),
      description: document.getElementById('pl-desc').value.trim(),
      lat: parseFloat(latInput.value),
      lng: parseFloat(lngInput.value),
      photoDataUrl: currentDataUrl,
    };

    await saveEntry(entry);
    addMarker(map, entry);
    map.flyTo({ center: [entry.lng, entry.lat], zoom: 14 });

    form.reset();
    preview.hidden = true;
    gpsStatus.hidden = true;
    currentDataUrl = null;
  });

  // Load existing entries
  try {
    const entries = await getAllEntries();
    map.on('load', () => loadMarkers(map, entries));
  } catch {
    // IndexedDB may not be available
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/photo-location-sw.js').catch(() => {});
  }
}
