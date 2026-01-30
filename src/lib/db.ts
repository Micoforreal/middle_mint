import { MongoClient, Db, Collection } from "mongodb";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

let client: MongoClient | null = null;
let db: Db | null = null;

interface DBCollections {
  jobs: Collection;
  applications: Collection;
  escrows: Collection;
  freelancer_profiles: Collection;
  streams: Collection;
}

let collections: DBCollections | null = null;

async function connectMongoDB(): Promise<Db> {
  if (db) return db;

  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    console.log("🔗 Connecting to MongoDB...");
    client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
    });
    await client.connect();
    db = client.db("middlemint");
    console.log("✅ Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
}

async function getCollections(): Promise<DBCollections> {
  if (collections) return collections;

  const database = await connectMongoDB();

  collections = {
    jobs: database.collection("jobs"),
    applications: database.collection("applications"),
    escrows: database.collection("escrows"),
    freelancer_profiles: database.collection("freelancer_profiles"),
    streams: database.collection("streams"),
  };

  // Create indexes
  try {
    await Promise.all([
      collections.jobs.createIndex({ client_wallet: 1 }),
      collections.applications.createIndex({ job_id: 1 }),
      collections.applications.createIndex({ freelancer_wallet: 1 }),
      collections.escrows.createIndex({ job_id: 1 }),
      collections.escrows.createIndex({ client_wallet: 1 }),
      collections.escrows.createIndex({ freelancer_wallet: 1 }),
      collections.freelancer_profiles.createIndex(
        { wallet: 1 },
        { unique: true },
      ),
      collections.streams.createIndex({ escrow_id: 1 }),
    ]);
    console.log("✅ Indexes created");
  } catch (err) {
    console.warn("Index creation warning:", err);
  }

  return collections;
}

export async function initializeDatabase() {
  console.log("✅ Initializing MongoDB database");
  await connectMongoDB();
  await getCollections();
  console.log("✅ Database initialized");
}

export async function getDB(): Promise<Db> {
  return connectMongoDB();
}

export async function getCollectionsDB(): Promise<DBCollections> {
  return getCollections();
}

// Legacy helper functions for compatibility
export async function queryDB(
  query: string,
  params: any[] = [],
): Promise<any[]> {
  // MongoDB doesn't use SQL queries
  return [];
}

export async function runDB(query: string, params: any[] = []): Promise<void> {
  // MongoDB doesn't use SQL queries
}
