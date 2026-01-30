import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'middlemint.json');

interface DBData {
  jobs: any[];
  applications: any[];
  escrows: any[];
  freelancer_profiles: any[];
  streams: any[];
}

let dbCache: DBData | null = null;

function loadDatabase(): DBData {
  if (dbCache) return dbCache;
  
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      dbCache = JSON.parse(data);
      console.log('✅ Loaded database from file');
      return dbCache as DBData;
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }

  // Return empty database
  dbCache = {
    jobs: [],
    applications: [],
    escrows: [],
    freelancer_profiles: [],
    streams: []
  };
  return dbCache;
}

function saveDatabase(data: DBData) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ Database saved to file');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

export function initializeDatabase() {
  console.log('✅ Initializing database at:', dbPath);
  loadDatabase();
  console.log('✅ Database initialized');
}

export function getDatabase(): DBData {
  return loadDatabase();
}

export function saveDB() {
  if (dbCache) {
    saveDatabase(dbCache);
  }
}

export function getDB() {
  return loadDatabase();
}

export function getDatabasePath(): string {
  return dbPath;
}

// Helper functions
export async function queryDB(sql: string, params: any[] = []): Promise<any[]> {
  return [];
}

export async function runDB(sql: string, params: any[] = []): Promise<void> {
  // no-op
}
