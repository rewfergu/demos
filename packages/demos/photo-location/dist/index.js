// photo-form.js
import { extractGps } from "@demo-archive/demo-utils/exif";
import { processImage } from "@demo-archive/demo-utils/image-processing";
import { PIN_SVG, setupMarkerDrag } from "@demo-archive/demo-utils/marker-drag";

// store.js
var DB_NAME = "photo-location-db";
var DB_VERSION = 2;
var STORE_NAME = "entries";
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
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
async function getAllEntriesMeta() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();
    const results = [];
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const { photoThumb, photoFull, ...meta } = cursor.value;
        results.push(meta);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
async function getEntryPhoto(id, key = "photoThumb") {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result?.[key] ?? null);
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
function addMarker(map, entry, loadPhoto) {
  const popup = new maplibregl.Popup({ offset: 25, maxWidth: "280px" });
  let objectUrl = null;
  popup.on("open", async () => {
    const blob = await loadPhoto(entry.id);
    if (!popup.isOpen())
      return;
    let imgHtml = "";
    if (blob) {
      if (objectUrl)
        URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(blob);
      imgHtml = `<img src="${objectUrl}" alt="${entry.name}" decoding="async" />`;
    }
    popup.setHTML(`
      <div class="marker-popup">
        ${imgHtml}
        <h3>${entry.name}</h3>
        <p>${entry.description}</p>
      </div>
    `);
  });
  popup.on("close", () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  });
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
function loadMarkers(map, entries, loadPhoto) {
  if (entries.length === 0)
    return;
  entries.forEach((entry) => addMarker(map, entry, loadPhoto));
  if (entries.length === 1) {
    map.flyTo({ center: [entries[0].lng, entries[0].lat], zoom: 12 });
  } else {
    const bounds = new maplibregl.LngLatBounds;
    entries.forEach((entry) => bounds.extend([entry.lng, entry.lat]));
    map.fitBounds(bounds, { padding: 60 });
  }
}

// photo-form.js
var loadPhoto = (id) => getEntryPhoto(id, "photoThumb");
function buildForm(container) {
  container.innerHTML = `
    <div class="pl-layout">
      <div class="pl-sidebar">
        <form class="pl-form" id="pl-form">
          <div class="pl-field">
            <label for="pl-photo">Photo</label>
            <input type="file" id="pl-photo" accept="image/*" capture="environment" />
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
  let currentBlobs = null;
  let previewObjectUrl = null;
  let photoHadGps = false;
  const setPreviewSrc = (blob) => {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
    }
    if (blob) {
      previewObjectUrl = URL.createObjectURL(blob);
      previewImg.src = previewObjectUrl;
    } else {
      previewImg.removeAttribute("src");
    }
  };
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
    currentBlobs = await processImage(file);
    setPreviewSrc(currentBlobs.thumb);
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
  }, { ghostClass: "pl-marker-drag-ghost", dropTargetClass: "pl-map-drop-target" });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const entry = {
      name: document.getElementById("pl-name").value.trim(),
      description: document.getElementById("pl-desc").value.trim(),
      lat: parseFloat(latInput.value),
      lng: parseFloat(lngInput.value),
      photoThumb: currentBlobs?.thumb ?? null,
      photoFull: currentBlobs?.full ?? null
    };
    const id = await saveEntry(entry);
    addMarker(map, { ...entry, id }, loadPhoto);
    map.flyTo({ center: [entry.lng, entry.lat], zoom: 14 });
    form.reset();
    preview.hidden = true;
    gpsStatus.hidden = true;
    previewMarker.clear();
    setPreviewSrc(null);
    currentBlobs = null;
    photoHadGps = false;
  });
  try {
    const entries = await getAllEntriesMeta();
    map.on("load", () => loadMarkers(map, entries, loadPhoto));
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
