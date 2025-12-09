import { openDB } from 'idb';

const DB_NAME = 'MedGameDB';
const DB_VERSION = 1;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('cases')) {
                db.createObjectStore('cases', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('assets')) {
                db.createObjectStore('assets', { keyPath: 'url' });
            }
            if (!db.objectStoreNames.contains('user_progress')) {
                db.createObjectStore('user_progress', { keyPath: 'caseId' });
            }
        },
    });
};

export const saveProgress = async (caseId: string, progress: any) => {
    const db = await initDB();
    return db.put('user_progress', { caseId, ...progress, timestamp: Date.now() });
};

export const getProgress = async (caseId: string) => {
    const db = await initDB();
    return db.get('user_progress', caseId);
};

export const cacheAsset = async (url: string, blob: Blob) => {
    const db = await initDB();
    return db.put('assets', { url, blob, timestamp: Date.now() });
}

export const getCachedAsset = async (url: string) => {
    const db = await initDB();
    return db.get('assets', url);
}
