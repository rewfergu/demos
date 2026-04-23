// exif.js
import ExifReader from "exifreader";
async function extractGps(file) {
  try {
    const buffer = await file.arrayBuffer();
    const tags = ExifReader.load(buffer, { expanded: true });
    if (tags.gps && tags.gps.Latitude != null && tags.gps.Longitude != null) {
      return {
        lat: tags.gps.Latitude,
        lng: tags.gps.Longitude
      };
    }
    return null;
  } catch {
    return null;
  }
}

// store.js
var DB_NAME = "photo-location-db";
var DB_VERSION = 1;
var STORE_NAME = "entries";
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveEntry(entry) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add({ ...entry, createdAt: Date.now() });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
async function getAllEntries() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

// map-view.js
import maplibregl from "maplibre-gl";
import"maplibre-gl/dist/maplibre-gl.css";
var mapStyle = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};
function initMap(containerId) {
  const map = new maplibregl.Map({
    container: containerId,
    style: mapStyle,
    center: [0, 20],
    zoom: 2
  });
  map.addControl(new maplibregl.NavigationControl, "top-right");
  return map;
}
function addMarker(map, entry) {
  const popupHtml = `
    <div class="marker-popup">
      <img src="${entry.photoDataUrl}" alt="${entry.name}" />
      <h3>${entry.name}</h3>
      <p>${entry.description}</p>
    </div>
  `;
  const popup = new maplibregl.Popup({ offset: 25, maxWidth: "280px" }).setHTML(popupHtml);
  new maplibregl.Marker({ color: "#e74c3c" }).setLngLat([entry.lng, entry.lat]).setPopup(popup).addTo(map);
}
function createPreviewMarker(map, onDragEnd) {
  const marker = new maplibregl.Marker({ color: "#3b82f6", draggable: true });
  marker.on("dragend", () => {
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
    }
  };
}
function loadMarkers(map, entries) {
  if (entries.length === 0)
    return;
  entries.forEach((entry) => addMarker(map, entry));
  if (entries.length === 1) {
    map.flyTo({ center: [entries[0].lng, entries[0].lat], zoom: 12 });
  } else {
    const bounds = new maplibregl.LngLatBounds;
    entries.forEach((entry) => bounds.extend([entry.lng, entry.lat]));
    map.fitBounds(bounds, { padding: 60 });
  }
}

// photo-form.js
var PIN_SVG = `
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
  </svg>
`;
function resizeImage(file, maxDim = 800) {
  return new Promise((resolve) => {
    const img = new Image;
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round(height * maxDim / width);
          width = maxDim;
        } else {
          width = Math.round(width * maxDim / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
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
  handle.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0)
      return;
    e.preventDefault();
    handle.setPointerCapture?.(e.pointerId);
    const ghost = document.createElement("div");
    ghost.className = "pl-marker-drag-ghost";
    ghost.innerHTML = PIN_SVG;
    document.body.appendChild(ghost);
    const positionGhost = (clientX, clientY) => {
      ghost.style.left = `${clientX}px`;
      ghost.style.top = `${clientY}px`;
    };
    positionGhost(e.clientX, e.clientY);
    const isOverMap = (clientX, clientY) => {
      const rect = mapContainer.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    };
    const onMove = (ev) => {
      positionGhost(ev.clientX, ev.clientY);
      mapContainer.classList.toggle("pl-map-drop-target", isOverMap(ev.clientX, ev.clientY));
    };
    const onUp = (ev) => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      ghost.remove();
      mapContainer.classList.remove("pl-map-drop-target");
      if (ev.type === "pointerup" && isOverMap(ev.clientX, ev.clientY)) {
        const rect = mapContainer.getBoundingClientRect();
        onDropOnMap(ev.clientX - rect.left, ev.clientY - rect.top);
      }
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  });
}
async function init(containerId = "photo-location") {
  const container = document.getElementById(containerId);
  if (!container)
    return;
  buildForm(container);
  const map = initMap("pl-map");
  const form = document.getElementById("pl-form");
  const photoInput = document.getElementById("pl-photo");
  const preview = document.getElementById("pl-preview");
  const previewImg = document.getElementById("pl-preview-img");
  const latInput = document.getElementById("pl-lat");
  const lngInput = document.getElementById("pl-lng");
  const gpsStatus = document.getElementById("pl-gps-status");
  const mapContainer = document.getElementById("pl-map");
  const dragHandle = document.getElementById("pl-marker-drag");
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
  latInput.addEventListener("input", syncPreviewMarker);
  lngInput.addEventListener("input", syncPreviewMarker);
  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (!file)
      return;
    currentDataUrl = await resizeImage(file);
    previewImg.src = currentDataUrl;
    preview.hidden = false;
    setStatus("Reading EXIF data...", "missing");
    const gps = await extractGps(file);
    if (gps) {
      latInput.value = gps.lat.toFixed(6);
      lngInput.value = gps.lng.toFixed(6);
      photoHadGps = true;
      setStatus("GPS coordinates extracted from photo. Drop the pin on the map to override.", "found");
      syncPreviewMarker();
      map.flyTo({ center: [gps.lng, gps.lat], zoom: 14 });
    } else {
      photoHadGps = false;
      setStatus("No GPS data found. Drag the pin onto the map or enter coordinates manually.", "missing");
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
      setStatus("Photo GPS overwritten with marker location.", "found");
    } else {
      setStatus("Location set from map. Drag the marker to fine-tune.", "found");
    }
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentDataUrl)
      return;
    const entry = {
      name: document.getElementById("pl-name").value.trim(),
      description: document.getElementById("pl-desc").value.trim(),
      lat: parseFloat(latInput.value),
      lng: parseFloat(lngInput.value),
      photoDataUrl: currentDataUrl
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
  try {
    const entries = await getAllEntries();
    map.on("load", () => loadMarkers(map, entries));
  } catch {
  }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/photo-location-sw.js").catch(() => {
    });
  }
}
export {
  init
};
