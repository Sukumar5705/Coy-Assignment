import { MatchesList } from '@/components/discover/MatchesList';
import { getMatches } from '@/lib/discovery';

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const initialMatches = await getMatches();
  return <MatchesList initialItems={initialMatches} />;
}
