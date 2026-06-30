import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { SCHEMA_SQL } from './schema';

dotenv.config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/coffee.db');

// Ensure the data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.exec(`PRAGMA journal_mode = WAL`);
db.exec(`PRAGMA foreign_keys = ON`);

// Create tables if they don't exist
db.exec(SCHEMA_SQL);

export default db;
