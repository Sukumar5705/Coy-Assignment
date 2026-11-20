import { SwipeDeck } from '@/components/discover/SwipeDeck';
import { getFeed } from '@/lib/discovery';

// Always read fresh swipe state from the DB.
export const dynamic = 'force-dynamic';

export default async function DeckPage() {
  // Runs on the server, in the same request as the page. The client gets the first
  // deck inside the HTML instead of: load JS -> hydrate -> useEffect -> fetch -> render.
  // getFeed() still goes through toPublicProfile(), so the privacy boundary is unchanged.
  const initialFeed = await getFeed();
  return <SwipeDeck initialFeed={initialFeed} />;
}
