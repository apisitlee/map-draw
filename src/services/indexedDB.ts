import { CustomFont } from '../types';

let dbInstance: IDBDatabase | null = null;

export function initFontDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    const request = indexedDB.open('MapCustomFontsDB', 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('fonts')) {
        db.createObjectStore('fonts', { keyPath: 'name' });
      }
    };
    request.onsuccess = (e) => {
      dbInstance = (e.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };
    request.onerror = (e) => reject(e);
  });
}

export async function getStoredFonts(): Promise<CustomFont[]> {
  const db = await initFontDB();
  return new Promise((resolve) => {
    const tx = db.transaction('fonts', 'readonly');
    const store = tx.objectStore('fonts');
    const req = store.getAll();
    req.onsuccess = () => {
      resolve(req.result || []);
    };
    req.onerror = () => resolve([]);
  });
}

export async function saveFontToDB(fontObj: CustomFont): Promise<void> {
  const db = await initFontDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fonts', 'readwrite');
    const store = tx.objectStore('fonts');
    const req = store.put(fontObj);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

export async function deleteFontFromDB(name: string): Promise<void> {
  const db = await initFontDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fonts', 'readwrite');
    const store = tx.objectStore('fonts');
    const req = store.delete(name);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}

export function registerFontFace(name: string, dataUrl: string): Promise<FontFace> {
  const font = new FontFace(name, `url(${dataUrl})`);
  return font.load().then((loadedFont) => {
    document.fonts.add(loadedFont);
    return loadedFont;
  });
}
