import { getMatches } from "@/lib/discovery";
import { handle, json } from "@/lib/http";

export const dynamic = "force-dynamic";

/** GET /api/matches: confirmed mutual matches only, public fields only. */
export async function GET() {
  return handle(async () => json(await getMatches()));
}
