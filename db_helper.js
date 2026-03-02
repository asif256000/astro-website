import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'profile.db');

// Check if DB exists before connecting
if (!fs.existsSync(dbPath)) {
    console.warn(`[Warning] Database file not found at: ${dbPath}`);
}

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

/**
 * Executes a SELECT query to read data.
 * @param {string} sql - The SQL query.
 * @param {Array} params - The parameters for the query.
 * @returns {Array} - The resulting rows.
 */
function read(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        return stmt.all(params);
    } catch (error) {
        console.error('Error executing read:', error.message);
        throw error;
    }
}

/**
 * Executes an INSERT, UPDATE, or DELETE query.
 * @param {string} sql - The SQL query.
 * @param {Array} params - The parameters for the query.
 * @returns {Object} - Information about the executed operation (changes, lastInsertRowid).
 */
function run(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        return stmt.run(params);
    } catch (error) {
        console.error('Error executing run:', error.message);
        throw error;
    }
}

/**
 * Retrieves basic info for the profile.
 */
function getBasicInfo() {
    return db.prepare('SELECT * FROM basic_info LIMIT 1').get();
}

/**
 * Updates basic info field.
 * @param {string} field - The column name to update.
 * @param {string|number} value - The relative value.
 */
function updateBasicInfoField(field, value, id = 1) {
    return run(`UPDATE basic_info SET ${field} = ? WHERE id = ?`, [value, id]);
}

/**
 * Closes the database connection.
 */
function close() {
    db.close();
}

/**
 * High-level generic CRUD functions
 */

/**
 * Inserts a new record into a table.
 * @param {string} table - The name of the table.
 * @param {Object} data - An object representing the key-value pairs to insert.
 * @returns {Object} - Information about the executed operation.
 */
function insertOne(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    return run(sql, values);
}

/**
 * Finds records in a table matching the given filters.
 * @param {string} table - The name of the table.
 * @param {Object} [filters={}] - Key-value pairs to filter by (e.g., { id: 1 }). If empty, returns all records.
 * @returns {Array} - The resulting rows.
 */
function find(table, filters = {}) {
    const keys = Object.keys(filters);
    if (keys.length === 0) {
        return read(`SELECT * FROM ${table}`);
    }
    const values = Object.values(filters);
    const whereClause = keys.map(k => `${k} = ?`).join(' AND ');
    const sql = `SELECT * FROM ${table} WHERE ${whereClause}`;
    return read(sql, values);
}

/**
 * Updates records in a table matching the given filters.
 * @param {string} table - The name of the table.
 * @param {Object} data - The completely new key-value data to update.
 * @param {Object} filters - Key-value pairs to identify which records to update.
 * @returns {Object} - Information about the executed operation.
 */
function updateOne(table, data, filters) {
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);
    const setClause = dataKeys.map(k => `${k} = ?`).join(', ');

    const filterKeys = Object.keys(filters);
    const filterValues = Object.values(filters);
    const whereClause = filterKeys.map(k => `${k} = ?`).join(' AND ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    return run(sql, [...dataValues, ...filterValues]);
}

/**
 * Deletes records from a table matching the given filters.
 * @param {string} table - The name of the table.
 * @param {Object} filters - Key-value pairs to identify which records to delete.
 * @returns {Object} - Information about the executed operation.
 */
function deleteOne(table, filters) {
    const keys = Object.keys(filters);
    const values = Object.values(filters);
    const whereClause = keys.map(k => `${k} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    return run(sql, values);
}

export {
    db,
    read,
    run,
    getBasicInfo,
    updateBasicInfoField,
    insertOne,
    find,
    updateOne,
    deleteOne,
    close
};

/*
    // Example Usage:
    
    import { find, insertOne, updateOne, deleteOne } from './db_helper.js';

    // Read all projects
    const allProjects = find('projects');
    console.log(allProjects);

    // Read specific project
    const specificProject = find('projects', { id: 1 });
    console.log(specificProject);

    // Create a new project
    insertOne('projects', { 
        title: 'New Project', 
        description: 'A cool new project', 
        link: 'https://example.com', 
        fk_user: 1 
    });

    // Update a project
    updateOne('projects', { title: 'Updated Project Name' }, { id: 1 });

    // Delete a project
    deleteOne('projects', { id: 2 });
*/
