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

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) {
    return null;
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

  try {
    return await clientPromise;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return null;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  const mongoClient = await getMongoClient();
  if (!mongoClient) return null;
  return mongoClient.db(dbName);
}
