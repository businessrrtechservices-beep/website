import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI?.trim() || "";
const dbName = process.env.MONGODB_DB?.trim() || "rrtechservices";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(
    uri &&
    uri.startsWith("mongodb") &&
    !uri.includes("<") &&
    !uri.includes("db_password")
  );
}

/**
 * Returns the connected MongoClient for the main cloud MongoDB instance.
 * Strictly requires the cloud MONGODB_URI; no local fallbacks.
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!isMongoConfigured()) {
    throw new Error(
      "Cloud MongoDB Atlas is not configured. Please set your valid cloud MONGODB_URI in .env.local."
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri);
      clientPromise = client.connect();
    }
  }

  return await clientPromise;
}

/**
 * Returns the Db instance directly from cloud MongoDB.
 */
export async function getMongoDb(): Promise<Db> {
  const mongoClient = await getMongoClient();
  return mongoClient.db(dbName);
}
