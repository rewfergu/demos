import { extractGps } from './exif.js';
import { saveEntry, getAllEntries } from './store.js';
import { initMap, addMarker, loadMarkers, createPreviewMarker } from './map-view.js';
import './style.css';

const PIN_SVG = `
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
  </svg>
`;

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
          <div class="pl-marker-drag-wrap">
            <button
              type="button"
              id="pl-marker-drag"
              class="pl-marker-drag"
              aria-label="Drag onto the map to set the location"
              title="Drag onto the map to set the location"
            >${PIN_SVG}</button>
            <span class="pl-marker-drag-hint">Drag this pin onto the map to set the location.</span>
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

function setupMarkerDrag(handle, mapContainer, onDropOnMap) {
  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    handle.setPointerCapture?.(e.pointerId);

    const ghost = document.createElement('div');
    ghost.className = 'pl-marker-drag-ghost';
    ghost.innerHTML = PIN_SVG;
    document.body.appendChild(ghost);
    const positionGhost = (clientX, clientY) => {
      ghost.style.left = `${clientX}px`;
      ghost.style.top = `${clientY}px`;
    };
    positionGhost(e.clientX, e.clientY);

    const isOverMap = (clientX, clientY) => {
      const rect = mapContainer.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    };

    const onMove = (ev) => {
      positionGhost(ev.clientX, ev.clientY);
      mapContainer.classList.toggle('pl-map-drop-target', isOverMap(ev.clientX, ev.clientY));
    };

    const onUp = (ev) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      ghost.remove();
      mapContainer.classList.remove('pl-map-drop-target');

      if (ev.type === 'pointerup' && isOverMap(ev.clientX, ev.clientY)) {
        const rect = mapContainer.getBoundingClientRect();
        onDropOnMap(ev.clientX - rect.left, ev.clientY - rect.top);
      }
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  });
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
  const mapContainer = document.getElementById('pl-map');
  const dragHandle = document.getElementById('pl-marker-drag');

  let currentDataUrl = null;
  let photoHadGps = false;

  const setStatus = (message, kind) => {
    gpsStatus.hidden = false;
    gpsStatus.textContent = message;
    gpsStatus.className = `pl-gps-status pl-gps-${kind}`;
  };

  const previewMarker = createPreviewMarker(map, (lng, lat) => {
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
  });

  const syncPreviewMarker = () => {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      previewMarker.set(lng, lat);
    } else {
      previewMarker.clear();
    }
  };

  latInput.addEventListener('input', syncPreviewMarker);
  lngInput.addEventListener('input', syncPreviewMarker);

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;

    currentDataUrl = await resizeImage(file);
    previewImg.src = currentDataUrl;
    preview.hidden = false;

    setStatus('Reading EXIF data...', 'missing');

    const gps = await extractGps(file);
    if (gps) {
      latInput.value = gps.lat.toFixed(6);
      lngInput.value = gps.lng.toFixed(6);
      photoHadGps = true;
      setStatus('GPS coordinates extracted from photo. Drop the pin on the map to override.', 'found');
      syncPreviewMarker();
      map.flyTo({ center: [gps.lng, gps.lat], zoom: 14 });
    } else {
      photoHadGps = false;
      setStatus('No GPS data found. Drag the pin onto the map or enter coordinates manually.', 'missing');
    }
  });

  setupMarkerDrag(dragHandle, mapContainer, (x, y) => {
    const { lng, lat } = map.unproject([x, y]);
    const overwritingPhotoGps = photoHadGps;
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);
    previewMarker.set(lng, lat);
    photoHadGps = false;
    if (overwritingPhotoGps) {
      setStatus('Photo GPS overwritten with marker location.', 'found');
    } else {
      setStatus('Location set from map. Drag the marker to fine-tune.', 'found');
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
    previewMarker.clear();
    currentDataUrl = null;
    photoHadGps = false;
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
