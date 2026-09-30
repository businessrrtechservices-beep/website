import { getMongoDb } from "./mongodb";
import { HeroConfig, defaultHeroConfig } from "./heroTypes";

export { defaultHeroConfig, type HeroConfig };

const COLLECTION_NAME = "hero_config";

/**
 * Cloud MongoDB Hero Service
 * Exclusively queries and saves to the Cloud MongoDB Atlas cluster.
 */

export async function getHeroConfig(): Promise<HeroConfig> {
  try {
    const db = await getMongoDb();
    const collection = db.collection<any>(COLLECTION_NAME);
    const doc = await collection.findOne({ key: "hero_main" });
    if (!doc) {
      await collection.insertOne({ key: "hero_main", ...defaultHeroConfig });
      return defaultHeroConfig;
    }
    const { _id, key, ...rest } = doc;
    return { ...defaultHeroConfig, ...rest };
  } catch (err) {
    console.error("Cloud MongoDB Hero query failed, returning defaults:", err);
    return defaultHeroConfig;
  }
}

export async function updateHeroConfig(config: Partial<HeroConfig>): Promise<HeroConfig> {
  const db = await getMongoDb();
  const collection = db.collection<any>(COLLECTION_NAME);
  const current = await getHeroConfig();
  const updated = { ...current, ...config };

  await collection.updateOne(
    { key: "hero_main" },
    { $set: { key: "hero_main", ...updated } },
    { upsert: true }
  );
  return updated;
}
