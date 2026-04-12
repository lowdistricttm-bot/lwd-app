"use client";

const DB_NAME = 'LowDistrictDB';
const STORE_NAME = 'stories';

// Inizializza il database IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Salva la storia nel database
export const saveStoryToDB = async (img: string) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const story = {
      id: 'my_story',
      img,
      timestamp: Date.now()
    };
    const request = store.put(story);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Recupera la storia e controlla la scadenza (24h)
export const getStoryFromDB = async (): Promise<{ img: string, timestamp: number } | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('my_story');
    request.onsuccess = () => {
      const result = request.result;
      if (!result) return resolve(null);
      
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (now - result.timestamp >= twentyFourHours) {
        deleteStoryFromDB(); // Elimina se scaduta
        return resolve(null);
      }
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
};

// Elimina la storia manualmente o alla scadenza
export const deleteStoryFromDB = async () => {
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).delete('my_story');
};