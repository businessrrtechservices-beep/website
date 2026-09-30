import { getMongoDb } from "./mongodb";
import { Product, products as initialProducts } from "./products";

const COLLECTION_NAME = "products";

/**
 * Cloud MongoDB Products Service
 * Exclusively queries and saves products to the Cloud MongoDB Atlas cluster.
 */

export async function getAllProducts(): Promise<Product[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<Product>(COLLECTION_NAME);
    const count = await collection.countDocuments();

    // Auto-seed cloud database if initial collection is empty
    if (count === 0) {
      await collection.insertMany(initialProducts as any);
      return initialProducts;
    }

    const items = await collection.find({}).toArray();
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
  
  const existing = await collection.findOne({ id: product.id } as any);
  if (existing) {
    product.id = `${product.id}-${Date.now()}`;
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

export async function seedProductsFromCode(force = false): Promise<number> {
  const db = await getMongoDb();
  const collection = db.collection<Product>(COLLECTION_NAME);
  if (force) {
    await collection.deleteMany({});
  } else {
    const count = await collection.countDocuments();
    if (count > 0) return count;
  }

  await collection.insertMany(initialProducts as any);
  return initialProducts.length;
}
