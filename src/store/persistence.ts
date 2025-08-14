import { compress, decompress } from 'lz4js';

const DB_NAME = 'deck-arcade';
const STORE_NAME = 'snapshots';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'seq' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSnapshot(seq: number, state: unknown): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(state));
  const blob = compress(data);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const req = store.put({ seq, ts: Date.now(), blob });
    req.onerror = () => reject(req.error);
  });
  db.close();
}

export async function loadLatestSnapshot(): Promise<{
  seq: number;
  state: unknown;
} | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  const records: { seq: number; ts: number; blob: Uint8Array }[] =
    await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as any);
      req.onerror = () => reject(req.error);
    });
  if (!records.length) {
    db.close();
    return null;
  }
  const latest = records.sort((a, b) => b.seq - a.seq)[0];
  const data = decompress(latest.blob);
  const dec = new TextDecoder();
  const state = JSON.parse(dec.decode(data));
  db.close();
  return { seq: latest.seq, state };
}
