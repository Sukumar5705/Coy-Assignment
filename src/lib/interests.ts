/**
 * SQLite has no list column, so `Profile.interests` is stored as a JSON-encoded string[].
 * These two helpers are the only place that knows about that encoding.
 */

export function encodeInterests(interests: string[]): string {
  return JSON.stringify(interests);
}

export function decodeInterests(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item): item is string => typeof item === "string")) {
      return parsed;
    }
  } catch {
    // fall through to the safe default
  }
  return [];
}
