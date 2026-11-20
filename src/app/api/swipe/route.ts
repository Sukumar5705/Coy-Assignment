import { recordSwipe } from "@/lib/discovery";
import { HttpError, handle, json } from "@/lib/http";
import { swipeBodySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/swipe  { profileId, direction: "LIKE" | "PASS" }
 *   200 { match: true, profile } | { match: false }
 *   400 invalid body, 404 unknown profile, 409 already swiped
 */
export async function POST(request: Request) {
  return handle(async () => {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      throw new HttpError(400, "Request body must be valid JSON");
    }

    const body = swipeBodySchema.parse(payload);
    return json(await recordSwipe(body));
  });
}
