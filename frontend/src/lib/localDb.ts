/**
 * Client-side persistence for anonymous users (IndexedDB via `idb`).
 *
 * Anonymous history / results / settings live only in the current browser and
 * are never sent to the server. Signed-in users use the API instead.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AnalysisResult, Analysis } from '@/types/analysis';
import type { UserSettings } from '@/types/settings';

interface ProvenanceDB extends DBSchema {
  analyses: {
    key: string;
    value: AnalysisResult & { createdAt: string };
    indexes: { 'by-date': string };
  };
  kv: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'provenance-inspector';
const DB_VERSION = 1;
const MAX_LOCAL_ANALYSES = 30;

let dbp: Promise<IDBPDatabase<ProvenanceDB>> | null = null;

function db() {
  if (!dbp) {
    dbp = openDB<ProvenanceDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        const store = database.createObjectStore('analyses', { keyPath: 'id' });
        store.createIndex('by-date', 'createdAt');
        database.createObjectStore('kv');
      },
    });
  }
  return dbp;
}

// --- analyses / history --------------------------------------------------

export async function saveLocalAnalysis(result: AnalysisResult): Promise<void> {
  try {
    const d = await db();
    await d.put('analyses', { ...result, createdAt: result.date || new Date().toISOString() });
    // trim to the most recent N
    const keys = await d.getAllKeysFromIndex('analyses', 'by-date');
    if (keys.length > MAX_LOCAL_ANALYSES) {
      const tx = d.transaction('analyses', 'readwrite');
      await Promise.all(
        keys.slice(0, keys.length - MAX_LOCAL_ANALYSES).map((k) => tx.store.delete(k)),
      );
      await tx.done;
    }
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export async function getLocalAnalysis(id: string): Promise<AnalysisResult | null> {
  try {
    const d = await db();
    return (await d.get('analyses', id)) ?? null;
  } catch {
    return null;
  }
}

export async function listLocalAnalyses(): Promise<Analysis[]> {
  try {
    const d = await db();
    const rows = await d.getAllFromIndex('analyses', 'by-date');
    return rows
      .reverse()
      .map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        date: r.date,
        status: r.status,
        score: r.score,
      }));
  } catch {
    return [];
  }
}

export async function deleteLocalAnalysis(id: string): Promise<void> {
  try {
    const d = await db();
    await d.delete('analyses', id);
  } catch {
    /* ignore */
  }
}

export async function clearLocalAnalyses(): Promise<void> {
  try {
    const d = await db();
    await d.clear('analyses');
  } catch {
    /* ignore */
  }
}

// --- key/value (settings, quota cache, blocked-until) ------------------

export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const d = await db();
    return ((await d.get('kv', key)) as T) ?? null;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  try {
    const d = await db();
    await d.put('kv', value, key);
  } catch {
    /* ignore */
  }
}

export const localSettings = {
  get: () => kvGet<UserSettings>('settings'),
  set: (s: UserSettings) => kvSet('settings', s),
};
