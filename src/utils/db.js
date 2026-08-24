import Database from 'better-sqlite3';
import path from 'path';

// Pointing to the profile.db in the root of the new project structure
// When deployed or run, ensure profile.db is placed in the project root
const dbPath = path.resolve(process.cwd(), 'profile.db');

let db;
try {
  db = new Database(dbPath, { readonly: true });
} catch (error) {
  console.warn(`[Warning] Could not connect to database at ${dbPath}.`, error.message);
}

export default db;

// Common pattern across pages: fetch basic_info (row id 1), derive the
// fk_user filter from it, then run a set of caller-supplied queries against
// that filter. `queries` maps a result key to a SQL string with a single
// `?` placeholder for fk_user. Every requested key defaults to `[]` so
// pages can safely .map() over results even if the DB is unavailable or a
// query fails partway through.
/**
 * @template {Record<string, string>} Q
 * @param {Q} queries
 * @returns {{ basic_info: any } & { [K in keyof Q]: any[] }}
 */
export function getData(queries = /** @type {Q} */ ({})) {
  const result = { basic_info: null };
  for (const key of Object.keys(queries)) {
    result[key] = [];
  }

  if (!db) return result;

  try {
    result.basic_info = db.prepare('SELECT * FROM basic_info WHERE id = 1').get() ?? null;
    const user_filter = result.basic_info ? result.basic_info.id : 1;

    for (const [key, sql] of Object.entries(queries)) {
      result[key] = db.prepare(sql).all(user_filter);
    }
  } catch (error) {
    console.error('Database query failed:', error.message);
  }

  return result;
}
