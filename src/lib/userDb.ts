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

let inMemoryUsers: User[] = [{ ...DEFAULT_ADMIN }];

export async function ensureAdminUser(): Promise<void> {
  try {
    const db = await getMongoDb();
    if (!db) return;

    const collection = db.collection<User>(COLLECTION_NAME);
    const existing = await collection.findOne({
      $or: [
        { username: DEFAULT_ADMIN.username },
        { email: DEFAULT_ADMIN.email },
      ],
    });

    if (!existing) {
      await collection.insertOne({ ...DEFAULT_ADMIN, createdAt: new Date() });
      console.log("Admin user created in MongoDB users collection");
    }
  } catch (error) {
    console.error("Error ensuring admin user:", error);
  }
}

export async function verifyUserCredentials(
  identifier: string,
  pass: string
): Promise<{ success: boolean; user?: { username: string; role: string; email: string } }> {
  const cleanId = (identifier || "").trim().toLowerCase();
  const cleanPass = (pass || "").trim();

  try {
    const db = await getMongoDb();
    if (db) {
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
    }
  } catch (error) {
    console.error("Error verifying credentials in DB:", error);
  }

  // Fallback to in-memory or env credentials
  const envUser = (process.env.ADMIN_USERNAME || DEFAULT_ADMIN.username).trim().toLowerCase();
  const envPass = (process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.password || "").trim();

  const isMatch =
    (cleanId === envUser || cleanId === DEFAULT_ADMIN.username.toLowerCase()) &&
    (cleanPass === envPass || cleanPass === DEFAULT_ADMIN.password);

  if (isMatch) {
    return {
      success: true,
      user: {
        username: DEFAULT_ADMIN.username,
        role: "admin",
        email: DEFAULT_ADMIN.email,
      },
    };
  }

  return { success: false };
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const db = await getMongoDb();
    if (!db) return inMemoryUsers.map(({ password, ...u }) => u as User);

    const collection = db.collection<User>(COLLECTION_NAME);
    const items = await collection.find({}, { projection: { password: 0 } }).toArray();
    return items.map(({ _id, ...rest }: any) => ({
      ...rest,
      id: _id.toString(),
    }));
  } catch {
    return inMemoryUsers.map(({ password, ...u }) => u as User);
  }
}
