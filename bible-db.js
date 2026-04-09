// bible-db.js — Manages full Bible storage in IndexedDB
// Downloads RVR60 from bolls.life once, stores locally for offline reading

const DB_NAME = 'BibleDB';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';
const META_STORE = 'meta';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME); // key: "bookId-chapter"
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

export async function isBibleDownloaded() {
  try {
    const db = await openDB();
    return new Promise(resolve => {
      const tx = db.transaction(META_STORE, 'readonly');
      const req = tx.objectStore(META_STORE).get('downloaded');
      req.onsuccess = () => resolve(req.result === true);
      req.onerror = () => resolve(false);
    });
  } catch { return false; }
}

export async function downloadBible(onProgress) {
  // Fetch the complete RVR60 Bible JSON from bolls.life
  const res = await fetch('https://bolls.life/static/translations/RVR60.json');
  if (!res.ok) throw new Error('No se pudo descargar la Biblia');

  // Stream with progress tracking
  const total = parseInt(res.headers.get('content-length') || '0');
  const reader = res.body.getReader();
  let received = 0;
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (onProgress && total) onProgress(Math.round((received / total) * 100));
  }

  const text = new TextDecoder().decode(
    chunks.reduce((acc, chunk) => {
      const merged = new Uint8Array(acc.length + chunk.length);
      merged.set(acc); merged.set(chunk, acc.length);
      return merged;
    }, new Uint8Array(0))
  );

  const allVerses = JSON.parse(text);
  await storeBible(allVerses, onProgress);
}

async function storeBible(verses, onProgress) {
  const db = await openDB();

  // Group by "bookId-chapter"
  const chapters = {};
  for (const v of verses) {
    const key = `${v.book}-${v.chapter}`;
    if (!chapters[key]) chapters[key] = [];
    chapters[key].push({ verse: v.verse, text: v.text });
  }

  const keys = Object.keys(chapters);
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (let i = 0; i < keys.length; i++) {
    store.put(chapters[keys[i]], keys[i]);
    if (onProgress && i % 100 === 0) onProgress(Math.round((i / keys.length) * 100));
  }

  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });

  // Mark as downloaded
  const metaTx = db.transaction(META_STORE, 'readwrite');
  metaTx.objectStore(META_STORE).put(true, 'downloaded');
  await new Promise((res, rej) => { metaTx.oncomplete = res; metaTx.onerror = rej; });
}

export async function getChapter(bookId, chapterNum) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(`${bookId}-${chapterNum}`);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch { return []; }
}

export async function clearBible() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.objectStore(META_STORE).clear();
    tx.oncomplete = res; tx.onerror = rej;
  });
}
