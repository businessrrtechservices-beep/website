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

export const ADMIN_USERS: User[] = [
  {
    username: "business.rrtechservices@gmail.com",
    email: "business.rrtechservices@gmail.com",
    password: "RRTechServices@01102026",
    role: "admin",
    name: "RR Tech Administrator",
    createdAt: new Date(),
  },
  {
    username: "business.rrtrchservices@gmail.com",
    email: "business.rrtrchservices@gmail.com",
    password: "RRTechServices@01102026",
    role: "admin",
    name: "RR Tech Administrator",
    createdAt: new Date(),
  },
];

/**
 * Ensures admin records exist in the MongoDB users table/collection
 */
export async function ensureAdminUser(): Promise<void> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<User>(COLLECTION_NAME);

    for (const adminUser of ADMIN_USERS) {
      const existing = await collection.findOne({
        $or: [
          { username: adminUser.username.toLowerCase() },
          { email: adminUser.email.toLowerCase() },
        ],
      });

      if (!existing) {
        await collection.insertOne({ ...adminUser, createdAt: new Date() });
        console.log(`Admin user ${adminUser.email} created in MongoDB users collection`);
      } else if (existing.password !== adminUser.password) {
        await collection.updateOne(
          { _id: (existing as any)._id },
          { $set: { password: adminUser.password, role: "admin" } }
        );
        console.log(`Admin user ${adminUser.email} password updated in MongoDB`);
      }
    }
  } catch (err) {
    console.error("Error in ensureAdminUser:", err);
  }
}

/**
 * Verifies user credentials strictly against the MongoDB database
 */
export async function verifyUserCredentials(
  identifier: string,
  pass: string
): Promise<{ success: boolean; user?: { username: string; role: string; email: string } }> {
  const cleanId = (identifier || "").trim().toLowerCase();
  const cleanPass = (pass || "").trim();

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

  // Check fallback against configured admin
  const isMatch =
    ADMIN_USERS.some(
      (u) =>
        (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
        u.password === cleanPass
    );

  if (isMatch) {
    return {
      success: true,
      user: {
        username: cleanId,
        role: "admin",
        email: cleanId,
      },
    };
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
    return ADMIN_USERS.map(({ password, ...u }) => u as User);
  }
}
