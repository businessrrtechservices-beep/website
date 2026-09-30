import { getMongoDb } from "./mongodb";
import { InventoryCategory, InventoryItem, StockAllocationRecord } from "./inventoryTypes";

const ITEMS_COLLECTION = "inventory_items";
const CATEGORIES_COLLECTION = "inventory_categories";

/**
 * Get categories strictly from Cloud MongoDB (no hardcoded defaults)
 */
export async function getCategories(): Promise<InventoryCategory[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<InventoryCategory>(CATEGORIES_COLLECTION);
    const items = await collection.find({}).toArray();
    return items.map(({ _id, ...rest }: any) => ({
      ...rest,
      id: rest.id || _id.toString(),
      subcategories: rest.subcategories || [],
    }));
  } catch (error) {
    console.error("Error fetching categories from Cloud MongoDB:", error);
    return [];
  }
}

export async function addCategory(category: InventoryCategory): Promise<InventoryCategory> {
  const db = await getMongoDb();
  const collection = db.collection<InventoryCategory>(CATEGORIES_COLLECTION);
  await collection.updateOne(
    { id: category.id },
    { $set: category },
    { upsert: true }
  );
  return category;
}

export async function addSubcategory(categoryId: string, subcategoryName: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<InventoryCategory>(CATEGORIES_COLLECTION);
  const result = await collection.updateOne(
    { id: categoryId },
    { $addToSet: { subcategories: subcategoryName.trim() } }
  );
  return result.matchedCount > 0;
}

/**
 * Generate next unique SKU / Item Code starting with "RRTS-"
 * e.g. RRTS-ITM-1001, RRTS-ITM-1002
 */
export async function generateNextItemCode(prefix = "RRTS-ITM"): Promise<string> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<InventoryItem>(ITEMS_COLLECTION);

    // Find highest matching code
    const regex = new RegExp(`^${prefix}-(\\d+)$`);
    const items = await collection
      .find({ code: { $regex: regex } })
      .project({ code: 1 })
      .toArray();

    let maxNum = 1000;
    for (const item of items) {
      const match = item.code?.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    return `${prefix}-${maxNum + 1}`;
  } catch (err) {
    return `${prefix}-${Date.now().toString().slice(-4)}`;
  }
}

/**
 * Get all inventory items with optional category or text search
 */
export async function getInventoryItems(options?: {
  category?: string;
  subcategory?: string;
  search?: string;
}): Promise<InventoryItem[]> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(ITEMS_COLLECTION);

    const query: any = {};
    if (options?.category && options.category !== "all") {
      query.category = options.category;
    }
    if (options?.subcategory && options.subcategory !== "all") {
      query.subcategory = options.subcategory;
    }
    if (options?.search) {
      const term = options.search.trim();
      query.$or = [
        { name: { $regex: term, $options: "i" } },
        { code: { $regex: term, $options: "i" } },
        { brand: { $regex: term, $options: "i" } },
        { model: { $regex: term, $options: "i" } },
        { serialNumbers: { $regex: term, $options: "i" } },
      ];
    }

    const items = await collection.find(query).sort({ updatedAt: -1, createdAt: -1 }).toArray();
    return items.map(({ _id, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
      availableQuantity: typeof rest.availableQuantity === "number" ? rest.availableQuantity : rest.stockQuantity || 0,
      allocatedRecords: rest.allocatedRecords || [],
      serialNumbers: rest.serialNumbers || [],
    }));
  } catch (error) {
    console.error("Error fetching inventory from Cloud MongoDB:", error);
    return [];
  }
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(ITEMS_COLLECTION);
    const item = await collection.findOne({ $or: [{ id }, { _id: id } as any] });
    if (!item) return null;
    const { _id, ...rest } = item;
    return {
      ...rest,
      id: rest.id || _id.toString(),
      availableQuantity: typeof rest.availableQuantity === "number" ? rest.availableQuantity : rest.stockQuantity || 0,
      allocatedRecords: rest.allocatedRecords || [],
      serialNumbers: rest.serialNumbers || [],
    };
  } catch {
    return null;
  }
}

/**
 * Add a new item to stock
 */
export async function createInventoryItem(
  data: Omit<InventoryItem, "id" | "code" | "createdAt" | "updatedAt" | "availableQuantity" | "allocatedRecords"> & {
    code?: string;
  }
): Promise<InventoryItem> {
  const db = await getMongoDb();
  const collection = db.collection<any>(ITEMS_COLLECTION);

  const code = data.code?.trim() || (await generateNextItemCode("RRTS-ITM"));
  const stockQuantity = Number(data.stockQuantity) || 1;

  const newItem: InventoryItem = {
    ...data,
    id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    code,
    stockQuantity,
    availableQuantity: stockQuantity,
    allocatedRecords: [],
    serialNumbers: data.serialNumbers || [],
    purchasePrice: Number(data.purchasePrice) || 0,
    sellingPrice: Number(data.sellingPrice) || 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await collection.insertOne(newItem as any);
  return newItem;
}

/**
 * Update stock item details or quantity
 */
export async function updateInventoryItem(
  id: string,
  updates: Partial<InventoryItem>
): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(ITEMS_COLLECTION);

  const current = await collection.findOne({ $or: [{ id }, { _id: id } as any] });
  if (!current) return false;

  const updateDoc: any = {
    ...updates,
    updatedAt: new Date(),
  };

  // If stockQuantity is modified, adjust availableQuantity proportionally
  if (typeof updates.stockQuantity === "number") {
    const allocatedCount = (current.allocatedRecords || []).reduce(
      (acc: number, r: StockAllocationRecord) => acc + (r.quantity || 0),
      0
    );
    updateDoc.availableQuantity = Math.max(0, updates.stockQuantity - allocatedCount);
  }

  const result = await collection.updateOne(
    { $or: [{ id }, { _id: id } as any] },
    { $set: updateDoc }
  );
  return result.matchedCount > 0;
}

/**
 * Allocate stock units to a customer sale/invoice (decrements availableQuantity and adds audit record)
 */
export async function allocateStockItem(
  itemId: string,
  record: StockAllocationRecord
): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(ITEMS_COLLECTION);

  const item = await collection.findOne({ $or: [{ id: itemId }, { _id: itemId } as any] });
  if (!item) return false;

  const currentAvailable = typeof item.availableQuantity === "number" ? item.availableQuantity : item.stockQuantity;
  const newAvailable = Math.max(0, currentAvailable - record.quantity);

  const result = await collection.updateOne(
    { $or: [{ id: itemId }, { _id: itemId } as any] },
    {
      $set: { availableQuantity: newAvailable, updatedAt: new Date() },
      $push: { allocatedRecords: record as any },
    }
  );

  return result.matchedCount > 0;
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const db = await getMongoDb();
  const collection = db.collection<any>(ITEMS_COLLECTION);
  const result = await collection.deleteOne({ $or: [{ id }, { _id: id } as any] });
  return result.deletedCount > 0;
}
