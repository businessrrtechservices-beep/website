import { getMongoDb } from "./mongodb";
import { HeroConfig, defaultHeroConfig } from "./heroTypes";

export { defaultHeroConfig, type HeroConfig };

const COLLECTION_NAME = "hero_config";
let inMemoryHeroConfig: HeroConfig = { ...defaultHeroConfig };

export async function getHeroConfig(): Promise<HeroConfig> {
  try {
    const db = await getMongoDb();
    if (!db) {
      return inMemoryHeroConfig;
    }
    const collection = db.collection<any>(COLLECTION_NAME);
    const doc = await collection.findOne({ key: "hero_main" });
    if (!doc) {
      await collection.insertOne({ key: "hero_main", ...defaultHeroConfig });
      return defaultHeroConfig;
    }
    const { _id, key, ...rest } = doc;
    return { ...defaultHeroConfig, ...rest };
  } catch (err) {
    console.error("Error reading hero config from DB:", err);
    return inMemoryHeroConfig;
  }
}

export async function updateHeroConfig(config: Partial<HeroConfig>): Promise<HeroConfig> {
  inMemoryHeroConfig = { ...inMemoryHeroConfig, ...config };
  try {
    const db = await getMongoDb();
    if (db) {
      const collection = db.collection(COLLECTION_NAME);
      await collection.updateOne(
        { key: "hero_main" },
        { $set: { key: "hero_main", ...inMemoryHeroConfig } },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error("Error saving hero config to DB:", err);
  }
  return inMemoryHeroConfig;
}
