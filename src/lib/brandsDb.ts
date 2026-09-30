import { getMongoDb } from "./mongodb";
import { Brand } from "./brandTypes";

const COLLECTION_NAME = "brands";

export async function getBrands(): Promise<Brand[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(COLLECTION_NAME);
    const items = await collection.find({}).sort({ name: 1 }).toArray();
    return items.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching brands from Cloud MongoDB:", error);
    return [];
  }
}

export async function createBrand(data: { name: string; category?: string; description?: string }): Promise<Brand> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);

  const cleanName = data.name.trim();
  const cleanId = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-");

  const existing = await collection.findOne({ $or: [{ id: cleanId }, { name: { $regex: new RegExp(`^${cleanName}$`, "i") } }] });
  if (existing) {
    return {
      ...existing,
      id: existing.id || existing._id.toString(),
    };
  }

  const newBrand: Brand = {
    id: cleanId,
    name: cleanName,
    category: data.category?.trim(),
    description: data.description?.trim(),
    createdAt: new Date(),
  };

  await collection.insertOne(newBrand as any);
  return newBrand;
}

export async function deleteBrand(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);
  const result = await collection.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}
