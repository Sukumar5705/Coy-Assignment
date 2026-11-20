import type { Profile, SwipeDirection, SwipeResult } from '@/types/profile';

export class ApiRequestError extends Error {
  constructor(public readonly status: number) {
    super(`Request failed (${status})`);
  }
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) throw new ApiRequestError(res.status);
  return res.json();
}

// Accepts either `[...]` or `{ profiles|matches: [...] }` from the backend.
const list = (d: any, key: string): Profile[] => (Array.isArray(d) ? d : d?.[key] ?? []);

export const fetchFeed = async () => list(await req('/api/feed'), 'profiles');
export const fetchMatches = async () => list(await req('/api/matches'), 'matches');
export const submitSwipe = (profileId: string, direction: SwipeDirection) =>
  req<SwipeResult>('/api/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, direction }),
  });
