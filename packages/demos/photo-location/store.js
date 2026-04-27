const DB_NAME = 'photo-location-db';
const DB_VERSION = 2;
const STORE_NAME = 'entries';

export function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveEntry(entry) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add({ ...entry, createdAt: Date.now() });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getAllEntriesMeta() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
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

export async function getEntryPhoto(id, key = 'photoThumb') {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result?.[key] ?? null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
