import { getFeed } from "@/lib/discovery";
import { handle, json } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/feed: unswiped profiles, public fields only. An empty array is valid. */
export async function GET() {
  return handle(async () => json(await getFeed()));
}
