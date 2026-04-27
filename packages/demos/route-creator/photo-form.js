import { extractGps } from '@demo-archive/demo-utils/exif';
import { processImage } from '@demo-archive/demo-utils/image-processing';
import { PIN_SVG, setupMarkerDrag } from '@demo-archive/demo-utils/marker-drag';
import { initMap, initRoute, createRouteRenderer, createPreviewMarker } from './map-view.js';
import './style.css';

function buildForm(container) {
  container.innerHTML = `
    <div class="rc-layout">
      <div class="rc-sidebar">
        <div class="rc-mode-toggle" role="tablist" aria-label="Mode">
          <button type="button" class="rc-mode-btn rc-mode-active" id="rc-mode-edit" role="tab" aria-selected="true">Edit</button>
          <button type="button" class="rc-mode-btn" id="rc-mode-view" role="tab" aria-selected="false">View</button>
        </div>
        <section class="rc-view" id="rc-view" hidden>
          <p class="rc-view-empty" id="rc-view-empty">No waypoints yet. Switch to Edit to add some.</p>
          <article class="rc-view-card" id="rc-view-card" hidden>
            <header class="rc-view-head">
              <span class="rc-view-index" id="rc-view-index">1</span>
              <span class="rc-view-position" id="rc-view-position">1 of 1</span>
            </header>
            <img class="rc-view-photo" id="rc-view-photo" alt="" />
            <h2 class="rc-view-name" id="rc-view-name"></h2>
            <p class="rc-view-desc" id="rc-view-desc" hidden></p>
            <div class="rc-view-coords" id="rc-view-coords"></div>
            <button type="button" class="rc-view-edit" id="rc-view-edit">Edit waypoint</button>
          </article>
          <div class="rc-view-nav" id="rc-view-nav" hidden>
            <button type="button" class="rc-view-btn" id="rc-view-prev">Previous</button>
            <button type="button" class="rc-view-btn" id="rc-view-next">Next</button>
          </div>
        </section>
        <form class="rc-form" id="rc-form">
          <div class="rc-field">
            <label for="rc-photo">Photo</label>
            <input type="file" id="rc-photo" accept="image/*" capture="environment" />
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
          <div class="rc-form-actions">
            <button type="submit" class="rc-submit" id="rc-submit">Add Waypoint</button>
            <button type="button" class="rc-cancel" id="rc-cancel-edit" hidden>Cancel</button>
          </div>
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
  const modeEditBtn = document.getElementById('rc-mode-edit');
  const modeViewBtn = document.getElementById('rc-mode-view');
  const viewPanel = document.getElementById('rc-view');
  const viewCard = document.getElementById('rc-view-card');
  const viewEmpty = document.getElementById('rc-view-empty');
  const viewNav = document.getElementById('rc-view-nav');
  const viewIndexEl = document.getElementById('rc-view-index');
  const viewPositionEl = document.getElementById('rc-view-position');
  const viewPhotoEl = document.getElementById('rc-view-photo');
  const viewNameEl = document.getElementById('rc-view-name');
  const viewDescEl = document.getElementById('rc-view-desc');
  const viewCoordsEl = document.getElementById('rc-view-coords');
  const viewPrevBtn = document.getElementById('rc-view-prev');
  const viewNextBtn = document.getElementById('rc-view-next');
  const viewEditBtn = document.getElementById('rc-view-edit');
  const submitBtn = document.getElementById('rc-submit');
  const cancelEditBtn = document.getElementById('rc-cancel-edit');

  let currentBlobs = null;
  let previewObjectUrl = null;
  let photoHadGps = false;
  const waypoints = [];
  let nextId = 1;
  let mode = 'edit';
  let viewIndex = 0;
  let editingId = null;

  const setPreviewSrc = (blob) => {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
    }
    if (blob) {
      previewObjectUrl = URL.createObjectURL(blob);
      previewImg.src = previewObjectUrl;
    } else {
      previewImg.removeAttribute('src');
    }
  };

  const releaseWaypoint = (w) => {
    if (w.thumbUrl) URL.revokeObjectURL(w.thumbUrl);
    if (w.fullUrl) URL.revokeObjectURL(w.fullUrl);
  };

  const resetFormState = () => {
    form.reset();
    preview.hidden = true;
    gpsStatus.hidden = true;
    previewMarker.clear();
    setPreviewSrc(null);
    currentBlobs = null;
    photoHadGps = false;
  };

  const enterEditMode = (w) => {
    editingId = w.id;
    nameInput.value = w.name;
    descInput.value = w.description;
    latInput.value = w.lat.toFixed(6);
    lngInput.value = w.lng.toFixed(6);
    if (w.fullUrl) {
      previewImg.src = w.fullUrl;
      preview.hidden = false;
    } else {
      previewImg.removeAttribute('src');
      preview.hidden = true;
    }
    photoInput.value = '';
    submitBtn.textContent = 'Update Waypoint';
    cancelEditBtn.hidden = false;
    gpsStatus.hidden = true;
    previewMarker.set(w.lng, w.lat);
  };

  const exitEditMode = () => {
    editingId = null;
    submitBtn.textContent = 'Add Waypoint';
    cancelEditBtn.hidden = true;
    resetFormState();
  };

  const confirmDiscardIfEditing = () => {
    if (editingId == null) return true;
    return window.confirm('Discard changes to this waypoint?');
  };

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

    currentBlobs = await processImage(file);
    setPreviewSrc(currentBlobs.thumb);
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
  }, { ghostClass: 'rc-marker-drag-ghost', dropTargetClass: 'rc-map-drop-target' });

  function renderList() {
    listEl.innerHTML = '';
    waypoints.forEach((w, i) => {
      const li = document.createElement('li');
      li.className = 'rc-list-item';

      const index = document.createElement('span');
      index.className = 'rc-list-index';
      index.textContent = String(i + 1);

      const thumb = w.thumbUrl
        ? Object.assign(document.createElement('img'), {
            className: 'rc-list-thumb',
            src: w.thumbUrl,
            alt: '',
          })
        : Object.assign(document.createElement('div'), {
            className: 'rc-list-thumb rc-list-thumb-empty',
          });

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
        if (editingId !== null && editingId !== w.id) {
          if (!confirmDiscardIfEditing()) return;
          exitEditMode();
        }
        if (mode === 'view') {
          viewIndex = i;
          renderView();
        }
        map.flyTo({ center: [w.lng, w.lat], zoom: 14 });
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'rc-list-remove';
      removeBtn.setAttribute('aria-label', `Remove waypoint ${i + 1}`);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => {
        if (!confirmDiscardIfEditing()) return;
        if (editingId !== null) exitEditMode();
        const idx = waypoints.findIndex((x) => x.id === w.id);
        if (idx >= 0) {
          releaseWaypoint(waypoints[idx]);
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

  function renderView() {
    const count = waypoints.length;
    viewEmpty.hidden = count > 0;
    viewCard.hidden = count === 0;
    viewNav.hidden = count === 0;

    if (count === 0) {
      route.setActive(-1);
      return;
    }

    if (viewIndex < 0) viewIndex = 0;
    if (viewIndex >= count) viewIndex = count - 1;

    const w = waypoints[viewIndex];
    viewIndexEl.textContent = String(viewIndex + 1);
    viewPositionEl.textContent = `${viewIndex + 1} of ${count}`;
    if (w.fullUrl) {
      viewPhotoEl.src = w.fullUrl;
      viewPhotoEl.alt = w.name;
      viewPhotoEl.hidden = false;
    } else {
      viewPhotoEl.removeAttribute('src');
      viewPhotoEl.hidden = true;
    }
    viewNameEl.textContent = w.name;
    viewDescEl.textContent = w.description;
    viewDescEl.hidden = !w.description;
    viewCoordsEl.textContent = `${w.lat.toFixed(5)}, ${w.lng.toFixed(5)}`;
    viewPrevBtn.disabled = viewIndex === 0;
    viewNextBtn.disabled = viewIndex === count - 1;

    route.setActive(viewIndex);
  }

  function setMode(next) {
    mode = next;
    const isEdit = mode === 'edit';
    modeEditBtn.classList.toggle('rc-mode-active', isEdit);
    modeViewBtn.classList.toggle('rc-mode-active', !isEdit);
    modeEditBtn.setAttribute('aria-selected', String(isEdit));
    modeViewBtn.setAttribute('aria-selected', String(!isEdit));
    form.hidden = !isEdit;
    viewPanel.hidden = isEdit;

    if (isEdit) {
      route.setActive(-1);
    } else {
      renderView();
      const w = waypoints[viewIndex];
      if (w) map.flyTo({ center: [w.lng, w.lat], zoom: 14 });
    }
  }

  function refresh() {
    renderList();
    const activeIdx = mode === 'view' && waypoints.length > 0
      ? Math.min(Math.max(viewIndex, 0), waypoints.length - 1)
      : -1;
    route.render(waypoints, activeIdx);
    if (mode === 'view') renderView();
  }

  modeEditBtn.addEventListener('click', () => setMode('edit'));
  modeViewBtn.addEventListener('click', () => {
    if (!confirmDiscardIfEditing()) return;
    if (editingId !== null) exitEditMode();
    setMode('view');
  });

  viewEditBtn.addEventListener('click', () => {
    const w = waypoints[viewIndex];
    if (!w) return;
    enterEditMode(w);
    setMode('edit');
    map.flyTo({ center: [w.lng, w.lat], zoom: 14 });
  });

  cancelEditBtn.addEventListener('click', () => {
    if (!confirmDiscardIfEditing()) return;
    exitEditMode();
    setMode('view');
  });

  viewPrevBtn.addEventListener('click', () => {
    if (viewIndex > 0) {
      viewIndex -= 1;
      renderView();
      const w = waypoints[viewIndex];
      if (w) map.flyTo({ center: [w.lng, w.lat], zoom: 14 });
    }
  });

  viewNextBtn.addEventListener('click', () => {
    if (viewIndex < waypoints.length - 1) {
      viewIndex += 1;
      renderView();
      const w = waypoints[viewIndex];
      if (w) map.flyTo({ center: [w.lng, w.lat], zoom: 14 });
    }
  });

  clearBtn.addEventListener('click', () => {
    if (!confirmDiscardIfEditing()) return;
    if (editingId !== null) exitEditMode();
    waypoints.forEach(releaseWaypoint);
    waypoints.length = 0;
    refresh();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (editingId !== null) {
      const idx = waypoints.findIndex((x) => x.id === editingId);
      if (idx < 0) {
        exitEditMode();
        return;
      }
      const w = waypoints[idx];
      w.name = nameInput.value.trim();
      w.description = descInput.value.trim();
      w.lat = parseFloat(latInput.value);
      w.lng = parseFloat(lngInput.value);
      if (currentBlobs) {
        releaseWaypoint(w);
        w.photoThumb = currentBlobs.thumb;
        w.photoFull = currentBlobs.full;
        w.thumbUrl = URL.createObjectURL(currentBlobs.thumb);
        w.fullUrl = URL.createObjectURL(currentBlobs.full);
      }
      viewIndex = idx;
      exitEditMode();
      setMode('view');
      refresh();
      return;
    }

    const entry = {
      id: nextId++,
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      lat: parseFloat(latInput.value),
      lng: parseFloat(lngInput.value),
      photoThumb: currentBlobs?.thumb ?? null,
      photoFull: currentBlobs?.full ?? null,
      thumbUrl: currentBlobs ? URL.createObjectURL(currentBlobs.thumb) : null,
      fullUrl: currentBlobs ? URL.createObjectURL(currentBlobs.full) : null,
    };

    waypoints.push(entry);
    refresh();
    resetFormState();
  });

  renderList();
}
