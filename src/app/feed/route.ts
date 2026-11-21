import { GET as getApiFeed } from "../api/feed/route";

export const dynamic = "force-dynamic";

/**
 * GET /feed
 *
 * Assignment-compatible alias for GET /api/feed.
 * Returns profiles that the user has not swiped on.
 * Only public profile fields are returned.
 */
export async function GET() {
    return getApiFeed();
}