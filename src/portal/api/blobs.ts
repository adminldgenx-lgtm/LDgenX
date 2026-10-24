// File contents for the demo, kept in the browser's IndexedDB (localStorage is too small for
// files). The server keeps them in object storage instead. Contents are stored as bytes and their
// type: Safari refuses Blob objects in some sessions (private browsing), never plain bytes.

const DB = 'ldgenx-portal-demo-files';
const STORE = 'files';

interface Stored {
  type: string;
  data: ArrayBuffer;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

export async function putBlob(id: string, blob: Blob) {
  const record: Stored = { type: blob.type, data: await blob.arrayBuffer() };
  return run('readwrite', (s) => s.put(record, id));
}
export async function getBlob(id: string) {
  const record = await run<Stored | undefined>('readonly', (s) => s.get(id));
  return record ? new Blob([record.data], { type: record.type }) : undefined;
}
export const deleteBlob = (id: string) => run('readwrite', (s) => s.delete(id));
export const clearBlobs = () => run('readwrite', (s) => s.clear());
