import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../../middlemint.json");

export interface DBData {
  jobs: any[];
  applications: any[];
  escrows: any[];
  freelancer_profiles: any[];
}

let dbInstance: DBData | null = null;

export function getDatabase(): DBData {
  if (!dbInstance) {
    initializeDatabase();
  }
  return dbInstance!;
}

export function initializeDatabase() {
  try {
    // Try to load existing database
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf-8");
      dbInstance = JSON.parse(data);
    } else {
      // Create empty database
      dbInstance = {
        jobs: [],
        applications: [],
        escrows: [],
        freelancer_profiles: [],
      };
      saveDatabase();
    }
  } catch (error) {
    console.error("Error loading database:", error);
    dbInstance = {
      jobs: [],
      applications: [],
      escrows: [],
      freelancer_profiles: [],
    };
  }
}

export function saveDatabase() {
  try {
    if (!dbInstance) return;
    fs.writeFileSync(dbPath, JSON.stringify(dbInstance, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving database:", error);
  }
}
