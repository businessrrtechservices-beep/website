import { getMongoDb } from "./mongodb";
import { Product } from "./productTypes";

const COLLECTION_NAME = "products";

/**
 * Cloud MongoDB Products Service
 * Exclusively queries and saves products to Cloud MongoDB.
 * Zero hardcoded products - only products created via Admin Panel.
 */

export async function getAllProducts(): Promise<Product[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<Product>(COLLECTION_NAME);
    const items = await collection.find({}).sort({ _id: -1 }).toArray();
    return items.map(({ _id, ...rest }: any) => ({
      ...rest,
      id: rest.id || _id.toString(),
    }));
  } catch (error) {
    console.error("Cloud MongoDB products fetch failed:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<Product>(COLLECTION_NAME);
    const item = await collection.findOne({ id } as any);
    if (!item) return null;
    const { _id, ...rest }: any = item;
    return { ...rest, id: rest.id || _id.toString() };
  } catch (error) {
    console.error(`Cloud MongoDB product fetch failed for id ${id}:`, error);
    return null;
  }
}

export async function createProduct(product: Product): Promise<Product> {
  const db = await getMongoDb();
  const collection = db.collection<Product>(COLLECTION_NAME);
  
  if (!product.id) {
    product.id = `prod-${Date.now()}`;
  } else {
    const existing = await collection.findOne({ id: product.id } as any);
    if (existing) {
      product.id = `${product.id}-${Date.now()}`;
    }
  }
  await collection.insertOne(product as any);
  return product;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<Product>(COLLECTION_NAME);
  const result = await collection.updateOne({ id } as any, { $set: product });
  return result.matchedCount > 0;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<Product>(COLLECTION_NAME);
  const result = await collection.deleteOne({ id } as any);
  return result.deletedCount > 0;
}
