import { getMongoDb } from "./mongodb";

export interface User {
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: "superadmin" | "admin" | "editor" | "viewer";
  name?: string;
  createdAt: Date;
}

const COLLECTION_NAME = "users";

/**
 * Gets configured admin credentials strictly from environment variables (.env.local)
 * Never hardcoded in source control.
 */
function getConfiguredAdmin(): { username: string; email: string; password?: string } | null {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!username || !password) {
    return null;
  }

  return {
    username,
    email: username,
    password,
  };
}

/**
 * Ensures superadmin record exists in the MongoDB users table using secure environment variables
 */
export async function ensureAdminUser(): Promise<void> {
  const envAdmin = getConfiguredAdmin();
  if (!envAdmin?.password) return;

  try {
    const db = await getMongoDb();
    const collection = db.collection<User>(COLLECTION_NAME);

    const existing = await collection.findOne({
      $or: [
        { username: envAdmin.username },
        { email: envAdmin.email },
      ],
    });

    if (!existing) {
      await collection.insertOne({
        username: envAdmin.username,
        email: envAdmin.email,
        password: envAdmin.password,
        role: "superadmin",
        name: "RR Tech Superadmin",
        createdAt: new Date(),
      });
    } else {
      await collection.updateOne(
        { _id: (existing as any)._id },
        { $set: { password: envAdmin.password, role: "superadmin", name: "RR Tech Superadmin" } }
      );
    }
  } catch (err) {
    console.error("Error ensuring superadmin user in DB:", err);
  }
}

/**
 * Verifies user credentials against MongoDB users collection, or secure env credentials
 */
export async function verifyUserCredentials(
  identifier: string,
  pass: string
): Promise<{ success: boolean; user?: { username: string; role: string; email: string } }> {
  const cleanId = (identifier || "").trim().toLowerCase();
  const cleanPass = (pass || "").trim();

  if (!cleanId || !cleanPass) {
    return { success: false };
  }

  try {
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
  } catch (err) {
    console.error("Error verifying credentials in DB:", err);
  }

  // Fallback to secure environment variables in .env.local
  const envAdmin = getConfiguredAdmin();
  if (envAdmin) {
    const isUserMatch =
      cleanId === envAdmin.username ||
      cleanId === envAdmin.email ||
      cleanId === "admin";
    const isPassMatch = cleanPass === envAdmin.password;

    if (isUserMatch && isPassMatch) {
      return {
        success: true,
        user: {
          username: envAdmin.username,
          role: "superadmin",
          email: envAdmin.email,
        },
      };
    }
  }

  return { success: false };
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<User>(COLLECTION_NAME);
    const items = await collection.find({}, { projection: { password: 0 } }).toArray();
    return items.map(({ _id, ...rest }: any) => ({
      ...rest,
      id: _id.toString(),
    }));
  } catch {
    const envAdmin = getConfiguredAdmin();
    if (envAdmin) {
      return [{
        username: envAdmin.username,
        email: envAdmin.email,
        role: "superadmin",
        createdAt: new Date(),
      }];
    }
    return [];
  }
}
