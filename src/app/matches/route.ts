import { GET as getApiMatches } from "../api/matches/route";

export const dynamic = "force-dynamic";

export async function GET() {
    return getApiMatches();
}