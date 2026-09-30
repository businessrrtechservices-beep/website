import { getMongoDb } from "./mongodb";

export interface User {
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: "admin" | "editor" | "viewer";
  name?: string;
  createdAt: Date;
}

const COLLECTION_NAME = "users";

export const DEFAULT_ADMIN: User = {
  username: "business.rrtechservices@gmail.com",
  email: "business.rrtechservices@gmail.com",
  password: "RRTechServices@01102026",
  role: "admin",
  name: "RR Tech Administrator",
  createdAt: new Date(),
};

/**
 * Ensures admin record exists in the cloud MongoDB users table/collection
 */
export async function ensureAdminUser(): Promise<void> {
  const db = await getMongoDb();
  const collection = db.collection<User>(COLLECTION_NAME);
  const existing = await collection.findOne({
    $or: [
      { username: DEFAULT_ADMIN.username },
      { email: DEFAULT_ADMIN.email },
    ],
  });

  if (!existing) {
    await collection.insertOne({ ...DEFAULT_ADMIN, createdAt: new Date() });
    console.log("Admin user created in Cloud MongoDB users collection");
  }
}

/**
 * Verifies user credentials strictly against the cloud MongoDB database
 */
export async function verifyUserCredentials(
  identifier: string,
  pass: string
): Promise<{ success: boolean; user?: { username: string; role: string; email: string } }> {
  const cleanId = (identifier || "").trim().toLowerCase();
  const cleanPass = (pass || "").trim();

  const db = await getMongoDb();
  const collection = db.collection<User>(COLLECTION_NAME);
  await ensureAdminUser();

  const user = await collection.findOne({
    $or: [
      { username: cleanId },
      { email: cleanId },
    ],
  });

  if (user && user.password === cleanPass) {
    return {
      success: true,
      user: {
        username: user.username,
        role: user.role,
        email: user.email,
      },
    };
  }

  return { success: false };
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getMongoDb();
  const collection = db.collection<User>(COLLECTION_NAME);
  const items = await collection.find({}, { projection: { password: 0 } }).toArray();
  return items.map(({ _id, ...rest }: any) => ({
    ...rest,
    id: _id.toString(),
  }));
}
