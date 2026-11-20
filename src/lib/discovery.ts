import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { publicProfileSelect, toPublicProfile } from "@/lib/toPublicProfile";
import type { PublicProfile, SwipeResponse } from "@/types/profile";
import type { SwipeBody } from "@/lib/validation";

/** Profiles the demo user has not swiped on yet. */
export async function getFeed(): Promise<PublicProfile[]> {
  const rows = await prisma.profile.findMany({
    where: { swipe: null },
    select: publicProfileSelect,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return rows.map(toPublicProfile);
}

/**
 * Records a swipe and reports whether it completed a match.
 *
 * Match rule (derived, never stored): direction === LIKE && profile.hasLikedUser.
 * Duplicate protection lives in the database (unique Swipe.profileId), so it holds
 * under double-taps and concurrent requests, not just in a pre-check.
 */
export async function recordSwipe({ profileId, direction }: SwipeBody): Promise<SwipeResponse> {
  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile) {
    throw new HttpError(404, "Profile not found");
  }

  try {
    await prisma.swipe.create({ data: { profileId, direction } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, "Profile already swiped");
    }
    throw err;
  }

  if (direction === "LIKE" && profile.hasLikedUser) {
    return { match: true, profile: toPublicProfile(profile) };
  }
  return { match: false };
}

/** Mutual matches only: the demo user liked them AND they already liked the demo user. */
export async function getMatches(): Promise<PublicProfile[]> {
  const rows = await prisma.profile.findMany({
    where: { hasLikedUser: true, swipe: { is: { direction: "LIKE" } } },
    select: publicProfileSelect,
    orderBy: { swipe: { createdAt: "asc" } },
  });
  return rows.map(toPublicProfile);
}
