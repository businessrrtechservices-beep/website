"use client";

// Client-side helper for seamless, non-blocking telemetry and user interest logging

const seenSections = new Set<string>();

export function trackVisit(path?: string) {
  if (typeof window === "undefined") return;

  const currentPath = path || window.location.pathname;
  const sessionKey = `rr_visit_${currentPath}`;

  // Only track once per tab session per page to keep metrics clean
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, "1");

  try {
    const payload = JSON.stringify({
      type: "visit",
      path: currentPath,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silent fail so user UX is never impacted
  }
}

export function trackSectionView(sectionId: string, cardId?: string) {
  if (typeof window === "undefined") return;

  const key = `${sectionId}_${cardId || ""}`;
  if (seenSections.has(key)) return;
  seenSections.add(key);

  try {
    const payload = JSON.stringify({
      type: "section_view",
      sectionId,
      cardId,
      path: window.location.pathname,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silent fail
  }
}

export function trackInterest(
  buttonText: string,
  options: {
    buttonId?: string;
    section?: string;
    targetUrl?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  if (typeof window === "undefined") return;

  try {
    const payload = JSON.stringify({
      type: "interest_click",
      buttonText,
      buttonId: options.buttonId || buttonText.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      section: options.section,
      targetUrl: options.targetUrl,
      metadata: options.metadata,
      path: window.location.pathname,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silent fail
  }
}
