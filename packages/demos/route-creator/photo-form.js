import { extractGps } from './exif.js';
import { initMap, initRoute, createRouteRenderer, createPreviewMarker } from './map-view.js';
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
    <div class="rc-layout">
      <div class="rc-sidebar">
        <form class="rc-form" id="rc-form">
          <div class="rc-field">
            <label for="rc-photo">Photo</label>
            <input type="file" id="rc-photo" accept="image/*" capture="environment" required />
            <div id="rc-preview" class="rc-preview" hidden>
              <img id="rc-preview-img" alt="Preview" />
            </div>
          </div>
          <div class="rc-field rc-row">
            <div>
              <label for="rc-lat">Latitude</label>
              <input type="number" id="rc-lat" step="any" min="-90" max="90" required placeholder="e.g. 40.7128" />
            </div>
            <div>
              <label for="rc-lng">Longitude</label>
              <input type="number" id="rc-lng" step="any" min="-180" max="180" required placeholder="e.g. -74.0060" />
            </div>
          </div>
          <div class="rc-marker-drag-wrap">
            <button
              type="button"
              id="rc-marker-drag"
              class="rc-marker-drag"
              aria-label="Drag onto the map to set the location"
              title="Drag onto the map to set the location"
            >${PIN_SVG}</button>
            <span class="rc-marker-drag-hint">Drag this pin onto the map to set the location.</span>
          </div>
          <div class="rc-gps-status" id="rc-gps-status" hidden></div>
          <div class="rc-field">
            <label for="rc-name">Waypoint Name</label>
            <input type="text" id="rc-name" required placeholder="e.g. Brooklyn Bridge" />
          </div>
          <div class="rc-field">
            <label for="rc-desc">Description</label>
            <textarea id="rc-desc" rows="3" placeholder="Describe this stop..."></textarea>
          </div>
          <button type="submit" class="rc-submit">Add Waypoint</button>
        </form>
        <div class="rc-route-panel">
          <div class="rc-route-header">
            <h3>Route</h3>
            <span class="rc-count" id="rc-count">0 waypoints</span>
          </div>
          <ol class="rc-list" id="rc-list"></ol>
          <p class="rc-empty" id="rc-empty">Add a waypoint to start the route.</p>
          <button type="button" class="rc-clear" id="rc-clear" hidden>Clear Route</button>
        </div>
      </div>
      <div class="rc-map-wrap">
        <div id="rc-map"></div>
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
    ghost.className = 'rc-marker-drag-ghost';
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
      mapContainer.classList.toggle('rc-map-drop-target', isOverMap(ev.clientX, ev.clientY));
    };

    const onUp = (ev) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      ghost.remove();
      mapContainer.classList.remove('rc-map-drop-target');

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

export async function init(containerId = 'route-creator') {
  const container = document.getElementById(containerId);
  if (!container) return;

  buildForm(container);

  const map = initMap('rc-map');
  initRoute(map);
  const route = createRouteRenderer(map);

  const form = document.getElementById('rc-form');
  const photoInput = document.getElementById('rc-photo');
  const preview = document.getElementById('rc-preview');
  const previewImg = document.getElementById('rc-preview-img');
  const latInput = document.getElementById('rc-lat');
  const lngInput = document.getElementById('rc-lng');
  const nameInput = document.getElementById('rc-name');
  const descInput = document.getElementById('rc-desc');
  const gpsStatus = document.getElementById('rc-gps-status');
  const mapContainer = document.getElementById('rc-map');
  const dragHandle = document.getElementById('rc-marker-drag');
  const listEl = document.getElementById('rc-list');
  const countEl = document.getElementById('rc-count');
  const emptyEl = document.getElementById('rc-empty');
  const clearBtn = document.getElementById('rc-clear');

  let currentDataUrl = null;
  let photoHadGps = false;
  const waypoints = [];
  let nextId = 1;

  const setStatus = (message, kind) => {
    gpsStatus.hidden = false;
    gpsStatus.textContent = message;
    gpsStatus.className = `rc-gps-status rc-gps-${kind}`;
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

  function renderList() {
    listEl.innerHTML = '';
    waypoints.forEach((w, i) => {
      const li = document.createElement('li');
      li.className = 'rc-list-item';

      const index = document.createElement('span');
      index.className = 'rc-list-index';
      index.textContent = String(i + 1);

      const thumb = document.createElement('img');
      thumb.className = 'rc-list-thumb';
      thumb.src = w.photoDataUrl;
      thumb.alt = '';

      const info = document.createElement('div');
      info.className = 'rc-list-info';
      const title = document.createElement('div');
      title.className = 'rc-list-title';
      title.textContent = w.name;
      const coords = document.createElement('div');
      coords.className = 'rc-list-coords';
      coords.textContent = `${w.lat.toFixed(4)}, ${w.lng.toFixed(4)}`;
      info.append(title, coords);

      const flyBtn = document.createElement('button');
      flyBtn.type = 'button';
      flyBtn.className = 'rc-list-fly';
      flyBtn.setAttribute('aria-label', `Fly to waypoint ${i + 1}`);
      flyBtn.textContent = 'Show';
      flyBtn.addEventListener('click', () => {
        map.flyTo({ center: [w.lng, w.lat], zoom: 14 });
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'rc-list-remove';
      removeBtn.setAttribute('aria-label', `Remove waypoint ${i + 1}`);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => {
        const idx = waypoints.findIndex((x) => x.id === w.id);
        if (idx >= 0) {
          waypoints.splice(idx, 1);
          refresh();
        }
      });

      li.append(index, thumb, info, flyBtn, removeBtn);
      listEl.appendChild(li);
    });

    const count = waypoints.length;
    countEl.textContent = `${count} waypoint${count === 1 ? '' : 's'}`;
    emptyEl.hidden = count > 0;
    clearBtn.hidden = count === 0;
  }

  function refresh() {
    renderList();
    route.render(waypoints);
  }

  clearBtn.addEventListener('click', () => {
    waypoints.length = 0;
    refresh();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentDataUrl) return;

    const entry = {
      id: nextId++,
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      lat: parseFloat(latInput.value),
      lng: parseFloat(lngInput.value),
      photoDataUrl: currentDataUrl,
    };

    waypoints.push(entry);
    refresh();

    form.reset();
    preview.hidden = true;
    gpsStatus.hidden = true;
    previewMarker.clear();
    currentDataUrl = null;
    photoHadGps = false;
  });

  renderList();
}
