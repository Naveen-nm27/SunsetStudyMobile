import { runDatabaseOperation } from './database';

export function readAppearance() {
  return runDatabaseOperation(async (db) => {
    const setting = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?', 'appearance');
    return setting?.value === 'light' || setting?.value === 'dark' ? setting.value : null;
  });
}

export function saveAppearance(mode) {
  return runDatabaseOperation((db) => db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`, 'appearance', mode,
  ));
}
