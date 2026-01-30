import path from "path";
import fs from "fs";
import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "middlemint.db");

let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    initializeDatabase();
  }
  return db!;
}

export function initializeDatabase() {
  try {
    // Open or create SQLite database
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    console.log(`✅ SQLite Database initialized at: ${dbPath}`);

    // Create tables if they don't exist
    createTables();
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

function createTables() {
  if (!db) return;

  try {
    // JOBS table
    db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        budget REAL NOT NULL,
        client_wallet TEXT NOT NULL,
        client_name TEXT,
        requirements TEXT,
        status TEXT DEFAULT 'open',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // APPLICATIONS table
    db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        freelancer_wallet TEXT NOT NULL,
        freelancer_name TEXT,
        cover_letter TEXT,
        requirements_response TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
      )
    `);

    // ESCROWS table
    db.exec(`
      CREATE TABLE IF NOT EXISTS escrows (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        application_id TEXT,
        client_wallet TEXT NOT NULL,
        freelancer_wallet TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        transaction_signature TEXT,
        work_submission_link TEXT,
        work_submission_proof TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        funded_at TEXT,
        released_at TEXT,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (application_id) REFERENCES applications(id)
      )
    `);

    // FREELANCER_PROFILES table
    db.exec(`
      CREATE TABLE IF NOT EXISTS freelancer_profiles (
        id TEXT PRIMARY KEY,
        wallet TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        speciality TEXT,
        rating REAL DEFAULT 0,
        total_earnings REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // STREAMS table
    db.exec(`
      CREATE TABLE IF NOT EXISTS streams (
        id TEXT PRIMARY KEY,
        escrow_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        recipient TEXT NOT NULL,
        mint TEXT NOT NULL,
        amount REAL NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        withdrawn REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        transaction_hash TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (escrow_id) REFERENCES escrows(id)
      )
    `);

    console.log("✅ All database tables created/verified");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
}

export function getDatabasePath(): string {
  return dbPath;
}

export interface DBData {
  jobs: any[];
  applications: any[];
  escrows: any[];
  freelancer_profiles: any[];
  streams: any[];
}

// Legacy function for compatibility
export function getDatabase(): DBData {
  const db = getDB();

  return {
    jobs: db.prepare("SELECT * FROM jobs").all(),
    applications: db.prepare("SELECT * FROM applications").all(),
    escrows: db.prepare("SELECT * FROM escrows").all(),
    freelancer_profiles: db.prepare("SELECT * FROM freelancer_profiles").all(),
    streams: db.prepare("SELECT * FROM streams").all(),
  };
}

// Legacy function for compatibility
export function saveDatabase() {
  // SQLite auto-saves, so this is a no-op
  // But we keep it for compatibility with existing code
}
