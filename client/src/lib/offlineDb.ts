// IndexedDB wrapper for offline deck/quiz storage

const DB_NAME = 'studybuild_offline';
const DB_VERSION = 1;
const STORE_DECKS = 'decks';
const STORE_QUEUE = 'sync_queue';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DECKS)) {
        db.createObjectStore(STORE_DECKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const qs = db.createObjectStore(STORE_QUEUE, { keyPath: 'id', autoIncrement: true });
        qs.createIndex('createdAt', 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => reject(req.error);
  });
}

function txStore(db: IDBDatabase, store: string, mode: IDBTransactionMode) {
  return db.transaction(store, mode).objectStore(store);
}

function wrap<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

export interface OfflineDeck {
  id: number;
  name: string;
  color: string;
  description: string;
  cards: { id: number; front: string; back: string }[];
  savedAt: number; // timestamp
}

export async function saveDeckOffline(deck: OfflineDeck): Promise<void> {
  const db = await openDb();
  await wrap(txStore(db, STORE_DECKS, 'readwrite').put({ ...deck, savedAt: Date.now() }));
  db.close();
}

export async function getOfflineDeck(id: number): Promise<OfflineDeck | null> {
  const db = await openDb();
  const result = await wrap<OfflineDeck | undefined>(txStore(db, STORE_DECKS, 'readonly').get(id));
  db.close();
  return result ?? null;
}

export async function getAllOfflineDecks(): Promise<OfflineDeck[]> {
  const db = await openDb();
  const result = await wrap<OfflineDeck[]>(txStore(db, STORE_DECKS, 'readonly').getAll());
  db.close();
  return result;
}

export async function removeOfflineDeck(id: number): Promise<void> {
  const db = await openDb();
  await wrap(txStore(db, STORE_DECKS, 'readwrite').delete(id));
  db.close();
}

export async function isStoredOffline(id: number): Promise<boolean> {
  const db = await openDb();
  const result = await wrap<OfflineDeck | undefined>(txStore(db, STORE_DECKS, 'readonly').get(id));
  db.close();
  return result !== undefined;
}

// Offline action queue (for future background sync)
export interface QueuedAction {
  type: string;
  payload: unknown;
  createdAt: number;
}

export async function queueAction(action: Omit<QueuedAction, 'createdAt'>): Promise<void> {
  const db = await openDb();
  await wrap(txStore(db, STORE_QUEUE, 'readwrite').add({ ...action, createdAt: Date.now() }));
  db.close();
}

export async function getQueuedActions(): Promise<(QueuedAction & { id: number })[]> {
  const db = await openDb();
  const result = await wrap<(QueuedAction & { id: number })[]>(txStore(db, STORE_QUEUE, 'readonly').getAll());
  db.close();
  return result;
}

export async function clearQueue(): Promise<void> {
  const db = await openDb();
  await wrap(txStore(db, STORE_QUEUE, 'readwrite').clear());
  db.close();
}
