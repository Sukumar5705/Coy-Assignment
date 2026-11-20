'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiRequestError, fetchFeed, submitSwipe } from './api';
import type { Profile, SwipeDirection } from '@/types/profile';

/**
 * Swipe state with OPTIMISTIC updates.
 *
 * Old flow:  animate out -> await POST -> remove card -> next card appears   (UI waits on the network)
 * New flow:  remove card instantly -> POST in the background -> reconcile    (UI never waits)
 *
 * The queue lives in a ref (the synchronous source of truth, so double-taps can never
 * pick the same card twice) and is mirrored into state for rendering.
 */
export function useSwipeDeck(initialFeed?: Profile[]) {
  const queueRef = useRef<Profile[]>(initialFeed ?? []);
  const [queue, setQueueState] = useState<Profile[]>(queueRef.current);
  const [loading, setLoading] = useState(!initialFeed);
  const [error, setError] = useState(false);
  const [swipeError, setSwipeError] = useState(false);
  // A list, so two matches arriving close together are shown one after the other, not lost.
  const [matches, setMatches] = useState<Profile[]>([]);

  const setQueue = useCallback((next: Profile[]) => {
    queueRef.current = next;
    setQueueState(next);
  }, []);

  /** Only used for the retry button; the first load comes from the server. */
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
  }, [setQueue]);

  // Warm the browser cache for the next few photos so a card never appears with an empty image.
  useEffect(() => {
    queue.slice(0, 4).forEach((p) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = p.photo;
    });
  }, [queue]);

  /** Synchronous: returns true if a card was swiped. */
  const swipe = useCallback(
    (direction: SwipeDirection) => {
      const [top, ...rest] = queueRef.current;
      if (!top) return false;

      setSwipeError(false);
      setQueue(rest); // instant: next card is promoted immediately

      submitSwipe(top.id, direction)
        .then((r) => {
          if (r.match) setMatches((m) => [...m, r.profile ?? top]);
        })
        .catch((err) => {
          // 409 = already swiped (other tab / double tap), 404 = gone: the card should stay removed.
          if (err instanceof ApiRequestError && (err.status === 409 || err.status === 404)) return;
          // Real failure: roll back so the user can retry the same card.
          setQueue([top, ...queueRef.current]);
          setSwipeError(true);
        });

      return true;
    },
    [setQueue]
  );

  return {
    queue,
    loading,
    error,
    swipeError,
    match: matches[0] ?? null,
    clearMatch: () => setMatches((m) => m.slice(1)),
    swipe,
    reload: load,
  };
}
