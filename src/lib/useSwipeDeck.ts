'use client';
import { useCallback, useEffect, useState } from 'react';
import { ApiRequestError, fetchFeed, submitSwipe } from './api';
import type { Profile, SwipeDirection } from '@/types/profile';

export function useSwipeDeck() {
  const [queue, setQueue] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [swipeError, setSwipeError] = useState(false);
  const [match, setMatch] = useState<Profile | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setQueue(await fetchFeed());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Resolves true if the swipe was accepted and the queue advanced. */
  const swipe = useCallback(
    async (direction: SwipeDirection) => {
      const top = queue[0];
      if (!top || busy) return false;
      setBusy(true);
      setSwipeError(false);
      try {
        const r = await submitSwipe(top.id, direction);
        if (r.match) setMatch(r.profile ?? top);
        setQueue((q) => q.filter((p) => p.id !== top.id));
        return true;
      } catch (err) {
        // 409: already swiped elsewhere (double-tap / other tab) -> the card is simply gone.
        if (err instanceof ApiRequestError && err.status === 409) {
          setQueue((q) => q.filter((p) => p.id !== top.id));
          return true;
        }
        setSwipeError(true);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [queue, busy]
  );

  return { queue, loading, error, busy, swipeError, match, clearMatch: () => setMatch(null), swipe, reload: load };
}
