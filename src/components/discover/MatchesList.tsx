'use client';
import { useCallback, useEffect, useState } from 'react';
import { fetchMatches } from '@/lib/api';
import { Avatar, Button } from '../ui';
import type { Profile } from '@/types/profile';

export function MatchesList({ initialItems }: { initialItems?: Profile[] }) {
  const [items, setItems] = useState<Profile[] | null>(initialItems ?? null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setItems(null);
    fetchMatches().then(setItems).catch(() => setError(true));
  }, []);
  // The server already sent the list; only fetch on the client if it didn't.
  useEffect(() => {
    if (!initialItems) load();
  }, [initialItems, load]);

  if (error)
    return (
      <div className="err" role="alert">
        <span>Couldn&apos;t load matches.</span>
        <Button variant="outline" onClick={load}>Try again</Button>
      </div>
    );
  if (!items) return <div className="skel" style={{ height: 180 }} aria-busy="true" />;
  if (!items.length) return <div className="empty"><b>No matches yet</b>Keep swiping.</div>;
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((m, i) => (
        <li key={m.id} className="row">
          <Avatar name={m.name} photo={m.photo} i={i} />
          <div><b>{m.name}{m.age ? `, ${m.age}` : ''}</b>{m.location && <span>{m.location}</span>}</div>
        </li>
      ))}
    </ul>
  );
}
