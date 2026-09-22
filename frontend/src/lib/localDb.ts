/**
 * Client-side persistence (IndexedDB via `idb`).
 *
 * History, results and settings live only in the current browser and are
 * never sent to the server.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AnalysisResult, Analysis, CleaningRecord } from '@/types/analysis';
import type { UserSettings } from '@/types/settings';

interface IaInspectorDB extends DBSchema {
  analyses: {
    key: string;
    value: AnalysisResult & { createdAt: string };
    indexes: { 'by-date': string };
  };
  kv: {
    key: string;
    value: unknown;
  };
  cleanings: {
    key: string;
    value: CleaningRecord;
    indexes: { 'by-date': string };
  };
}

const DB_NAME = 'ai-inspector';
const DB_VERSION = 2;

let dbp: Promise<IDBPDatabase<IaInspectorDB>> | null = null;

function db() {
  if (!dbp) {
    dbp = openDB<IaInspectorDB>(DB_NAME, DB_VERSION, {
      // Additive migrations only: existing history and settings are kept.
      upgrade(database, oldVersion) {
        if (oldVersion < 1) {
          const store = database.createObjectStore('analyses', { keyPath: 'id' });
          store.createIndex('by-date', 'createdAt');
          database.createObjectStore('kv');
        }
        if (oldVersion < 2) {
          database.createObjectStore('cleanings', { keyPath: 'id' }).createIndex('by-date', 'date');
        }
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
  } catch {
    /* storage unavailable, non-fatal */
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

// --- cleaning runs ------------------------------------------------------

export async function saveLocalCleaning(record: CleaningRecord): Promise<void> {
  try {
    const d = await db();
    await d.put('cleanings', record);
  } catch {
    /* storage unavailable, non-fatal */
  }
}

export async function listLocalCleanings(): Promise<CleaningRecord[]> {
  try {
    const d = await db();
    return (await d.getAllFromIndex('cleanings', 'by-date')).reverse();
  } catch {
    return [];
  }
}

export async function deleteLocalCleaning(id: string): Promise<void> {
  try {
    const d = await db();
    await d.delete('cleanings', id);
  } catch {
    /* ignore */
  }
}

export async function clearLocalCleanings(): Promise<void> {
  try {
    const d = await db();
    await d.clear('cleanings');
  } catch {
    /* ignore */
  }
}

// --- key/value (settings) ----------------------------------------------

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
