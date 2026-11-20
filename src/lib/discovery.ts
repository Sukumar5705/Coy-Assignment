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
 * ONE query: insert the swipe and read the profile through the relation in the same call.
 *  - unique Swipe.profileId violated (P2002)  -> 409 already swiped
 *  - foreign key violated, no such profile (P2003) -> 404
 * Match rule (derived, never stored): direction === LIKE && profile.hasLikedUser.
 * Duplicate protection still lives in the database, so it holds under double-taps and races.
 */
export async function recordSwipe({ profileId, direction }: SwipeBody): Promise<SwipeResponse> {
  try {
    const { profile } = await prisma.swipe.create({
      data: { profileId, direction },
      select: { profile: { select: { ...publicProfileSelect, hasLikedUser: true } } },
    });

    if (direction === "LIKE" && profile.hasLikedUser) {
      // toPublicProfile() is an allow-list: hasLikedUser is dropped here.
      return { match: true, profile: toPublicProfile(profile) };
    }
    return { match: false };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") throw new HttpError(409, "Profile already swiped");
      if (err.code === "P2003") throw new HttpError(404, "Profile not found");
    }
    throw err;
  }
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
