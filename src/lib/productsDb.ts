import { getMongoDb, isMongoConfigured } from "./mongodb";
import { Product, products as initialProducts } from "./products";

const COLLECTION_NAME = "products";

// In-memory fallback if MongoDB is not configured or during transitions
let inMemoryProducts: Product[] = [...initialProducts];

export async function getAllProducts(): Promise<Product[]> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return inMemoryProducts;
    }

    const collection = db.collection<Product>(COLLECTION_NAME);
    const count = await collection.countDocuments();

    // Auto-seed if empty
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
    console.error("Error reading products from DB, falling back to static:", error);
    return inMemoryProducts;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return inMemoryProducts.find((p) => p.id === id) || null;
    }
    const collection = db.collection<Product>(COLLECTION_NAME);
    const item = await collection.findOne({ id } as any);
    if (!item) return null;
    const { _id, ...rest }: any = item;
    return { ...rest, id: rest.id || _id.toString() };
  } catch {
    return inMemoryProducts.find((p) => p.id === id) || null;
  }
}

export async function createProduct(product: Product): Promise<Product> {
  const db = await getMongoDb();
  if (!db) {
    inMemoryProducts.unshift(product);
    return product;
  }

  const collection = db.collection<Product>(COLLECTION_NAME);
  // Ensure unique ID
  const existing = await collection.findOne({ id: product.id } as any);
  if (existing) {
    product.id = `${product.id}-${Date.now()}`;
  }
  await collection.insertOne(product as any);
  return product;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<boolean> {
  const db = await getMongoDb();
  if (!db) {
    const idx = inMemoryProducts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      inMemoryProducts[idx] = { ...inMemoryProducts[idx], ...product };
      return true;
    }
    return false;
  }

  const collection = db.collection<Product>(COLLECTION_NAME);
  const result = await collection.updateOne({ id } as any, { $set: product });
  return result.matchedCount > 0;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (!db) {
    const prevLen = inMemoryProducts.length;
    inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id);
    return inMemoryProducts.length < prevLen;
  }

  const collection = db.collection<Product>(COLLECTION_NAME);
  const result = await collection.deleteOne({ id } as any);
  return result.deletedCount > 0;
}

export async function seedProductsFromCode(force = false): Promise<number> {
  const db = await getMongoDb();
  if (!db) {
    inMemoryProducts = [...initialProducts];
    return inMemoryProducts.length;
  }

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
