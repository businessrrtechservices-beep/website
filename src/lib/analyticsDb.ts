import { getMongoDb } from "./mongodb";

export type AnalyticsEventType = "visit" | "section_view" | "interest_click";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  path?: string;
  sectionId?: string;
  cardId?: string;
  buttonId?: string;
  buttonText?: string;
  targetUrl?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
}

const COLLECTION_NAME = "analytics_events";

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Record an analytics event strictly in Cloud MongoDB
 */
export async function recordAnalyticsEvent(
  rawEvent: Omit<AnalyticsEvent, "timestamp" | "dateStr">
): Promise<boolean> {
  const event: AnalyticsEvent = {
    ...rawEvent,
    timestamp: Date.now(),
    dateStr: getTodayString(),
  };

  const db = await getMongoDb();
  const collection = db.collection<AnalyticsEvent>(COLLECTION_NAME);
  await collection.insertOne(event as any);
  return true;
}

export interface AnalyticsSummary {
  totalVisits: number;
  todayVisits: number;
  totalInterests: number;
  todayInterests: number;
  recentInterests: AnalyticsEvent[];
  sectionViews: { sectionId: string; count: number }[];
  interestButtons: { buttonText: string; count: number; lastTarget?: string }[];
  dailyVisits: { date: string; visits: number; interests: number }[];
  dbConnected: boolean;
}

/**
 * Query and aggregate analytics strictly from Cloud MongoDB
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const today = getTodayString();
  const db = await getMongoDb();
  const collection = db.collection<AnalyticsEvent>(COLLECTION_NAME);

  const [
    totalVisits,
    todayVisits,
    totalInterests,
    todayInterests,
    recentInterestsRaw,
    sectionAgg,
    interestAgg,
  ] = await Promise.all([
    collection.countDocuments({ type: "visit" }),
    collection.countDocuments({ type: "visit", dateStr: today }),
    collection.countDocuments({ type: "interest_click" }),
    collection.countDocuments({ type: "interest_click", dateStr: today }),
    collection
      .find({ type: "interest_click" })
      .sort({ timestamp: -1 })
      .limit(30)
      .toArray(),
    collection
      .aggregate([
        { $match: { type: "section_view" } },
        { $group: { _id: "$sectionId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray(),
    collection
      .aggregate([
        { $match: { type: "interest_click" } },
        {
          $group: {
            _id: "$buttonText",
            count: { $sum: 1 },
            lastTarget: { $last: "$targetUrl" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray(),
  ]);

  const recentInterests = recentInterestsRaw.map(({ _id, ...rest }: any) => rest);

  const sectionViews = sectionAgg.map((item: any) => ({
    sectionId: item._id || "unknown",
    count: item.count,
  }));

  const interestButtons = interestAgg.map((item: any) => ({
    buttonText: item._id || "Unnamed Action",
    count: item.count,
    lastTarget: item.lastTarget,
  }));

  return {
    totalVisits,
    todayVisits,
    totalInterests,
    todayInterests,
    recentInterests,
    sectionViews,
    interestButtons,
    dailyVisits: [],
    dbConnected: true,
  };
}
