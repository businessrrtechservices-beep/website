"use client";

import { useEffect } from "react";
import { trackVisit } from "@/lib/analyticsClient";

export default function AnalyticsTracker() {
  useEffect(() => {
    trackVisit();
  }, []);

  return null;
}
