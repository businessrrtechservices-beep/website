/**
 * Indian Standard Time (IST) Date & Time Utilities
 * Time Zone: Asia/Kolkata (UTC +05:30)
 */

export const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Returns current timestamp formatted for <input type="datetime-local" /> in IST (YYYY-MM-DDTHH:mm)
 */
export function getISTDateTimeLocal(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  let hour = get("hour");
  if (hour === "24") hour = "00";
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

/**
 * Returns current date formatted for <input type="date" /> in IST (YYYY-MM-DD)
 */
export function getISTDateString(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Converts a datetime-local input string (e.g. "2026-09-30T14:45") into a standardized
 * ISO string in IST (+05:30). If empty, returns current time in IST format.
 */
export function parseToISTIsoString(datetimeLocalOrIso?: string): string {
  if (!datetimeLocalOrIso || !datetimeLocalOrIso.trim()) {
    return getNowISTIsoString();
  }

  const trimmed = datetimeLocalOrIso.trim();

  // If already contains offset or Z, parse as Date and return ISO
  if (trimmed.includes("Z") || trimmed.includes("+") || trimmed.includes("-", 10)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Format YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss -> append +05:30
  if (trimmed.length === 16) {
    const withOffset = `${trimmed}:00+05:30`;
    const d = new Date(withOffset);
    if (!isNaN(d.getTime())) return d.toISOString();
  } else if (trimmed.length === 19) {
    const withOffset = `${trimmed}+05:30`;
    const d = new Date(withOffset);
    if (!isNaN(d.getTime())) return d.toISOString();
  } else if (trimmed.length === 10) {
    // Just date YYYY-MM-DD
    const withOffset = `${trimmed}T00:00:00+05:30`;
    const d = new Date(withOffset);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  const fallback = new Date(trimmed);
  return !isNaN(fallback.getTime()) ? fallback.toISOString() : new Date().toISOString();
}

/**
 * Returns current time as an ISO string
 */
export function getNowISTIsoString(): string {
  return new Date().toISOString();
}

/**
 * Formats any Date object or ISO string in Indian Standard Time (IST):
 * e.g., "30 Sep 2026, 02:45 pm"
 */
export function formatISTDateTime(
  dateInput?: string | Date | null,
  options?: { showSeconds?: boolean }
): string {
  if (!dateInput) return "-";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  return d.toLocaleString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: options?.showSeconds ? "2-digit" : undefined,
    hour12: true,
  });
}

/**
 * Formats any Date object or ISO string as an IST Date:
 * e.g., "30 Sep 2026"
 */
export function formatISTDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "-";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  return d.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats time only in IST: e.g. "02:45 PM"
 */
export function formatISTTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "-";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  return d.toLocaleTimeString("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Returns current Monday to Sunday date range strings (YYYY-MM-DD) in IST
 */
export function getISTWeekRange(d: Date = new Date()): { start: string; end: string } {
  const todayStr = getISTDateString(d);
  const [y, m, day] = todayStr.split("-").map(Number);
  const curr = new Date(Date.UTC(y, m - 1, day));
  const dayOfWeek = curr.getUTCDay(); // 0 = Sun, 1 = Mon ...
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(curr.getTime() - diffToMonday * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  const fmt = (dt: Date) => dt.toISOString().slice(0, 10);
  return {
    start: fmt(monday),
    end: fmt(sunday),
  };
}

/**
 * Returns current month date range (YYYY-MM-01 to end of month) in IST
 */
export function getISTMonthRange(d: Date = new Date()): { start: string; end: string; monthStr: string } {
  const todayStr = getISTDateString(d);
  const monthStr = todayStr.slice(0, 7);
  const [y, m] = monthStr.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return {
    start: `${monthStr}-01`,
    end: `${monthStr}-${String(lastDay).padStart(2, "0")}`,
    monthStr,
  };
}
