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
