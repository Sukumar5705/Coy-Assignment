
/**
 * End-to-end API acceptance tests for Coy Discover.
 *
 * Covers the PRD/SRD requirements:
 * - Minimum 30 seeded profiles
 * - GET /api/feed and GET /feed
 * - POST /api/swipe and POST /swipe
 * - GET /api/matches and GET /matches
 * - Like, Pass and mutual matching behavior
 * - Duplicate and concurrent swipe protection
 * - Input validation and error handling
 * - Feed exclusion and deck exhaustion
 * - Public response field allow-list
 * - One-sided-like privacy
 * - Database persistence
 *
 * Usage:
 *
 *   npm run db:reset
 *   npm run dev
 *   npm run test:api
 *
 * BASE_URL defaults to http://localhost:3000.
 *
 * IMPORTANT:
 * Run against a disposable, freshly seeded test database.
 * This script swipes through the entire deck.
 *
 * The internal hasLikedUser flag is read directly from the
 * database for test setup. It is never exposed through the API.
 */

import { PrismaClient } from "@prisma/client";

const BASE_URL =
  process.env.BASE_URL ?? "http://localhost:3000";

const prisma = new PrismaClient();

type PublicProfile = {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string[];
};

type ApiResult = {
  status: number;
  text: string;
  body: unknown;
};

const PUBLIC_PROFILE_KEYS = [
  "age",
  "bio",
  "id",
  "interests",
  "location",
  "name",
  "photo",
].join("|");

const SECRET_FIELD_PATTERN =
  /hasLikedUser|likedUser|likesYou/i;

let failures = 0;
let totalChecks = 0;

function check(
  label: string,
  condition: boolean,
  detail?: unknown
): void {
  totalChecks++;

  if (condition) {
    console.log(`  PASS  ${label}`);
    return;
  }

  failures++;

  console.error(
    `  FAIL  ${label}`,
    detail !== undefined
      ? JSON.stringify(detail)
      : ""
  );
}

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isPublicProfile(
  value: unknown
): value is PublicProfile {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.age === "number" &&
    typeof value.photo === "string" &&
    typeof value.bio === "string" &&
    typeof value.location === "string" &&
    Array.isArray(value.interests) &&
    value.interests.every(
      (interest) => typeof interest === "string"
    )
  );
}

function isPublicProfileArray(
  value: unknown
): value is PublicProfile[] {
  return (
    Array.isArray(value) &&
    value.every(isPublicProfile)
  );
}

async function call(
  path: string,
  init?: RequestInit
): Promise<ApiResult> {
  const response = await fetch(
    `${BASE_URL}${path}`,
    init
  );

  const text = await response.text();

  let body: unknown = null;

  try {
    body = JSON.parse(text);
  } catch {
    // Preserve non-JSON response as text.
  }

  return {
    status: response.status,
    text,
    body,
  };
}

async function submitSwipe(
  path: string,
  profileId: string,
  direction: string
): Promise<ApiResult> {
  return call(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      profileId,
      direction,
    }),
  });
}

function sameJson(
  first: unknown,
  second: unknown
): boolean {
  return (
    JSON.stringify(first) ===
    JSON.stringify(second)
  );
}

function hasOnlyPublicFields(
  profiles: unknown
): boolean {
  if (!isPublicProfileArray(profiles)) {
    return false;
  }

  return profiles.every((profile) => {
    const keys = Object.keys(profile)
      .sort()
      .join("|");

    return keys === PUBLIC_PROFILE_KEYS;
  });
}

async function main(): Promise<void> {
  console.log("\n==================================");
  console.log(" COY DISCOVER - API ACCEPTANCE TEST");
  console.log("==================================\n");

  /*
   * 1. Database preflight
   */

  console.log("Database preflight");

  const [
    profileCount,
    existingSwipeCount,
    likers,
    nonLikers,
  ] = await Promise.all([
    prisma.profile.count(),

    prisma.swipe.count(),

    prisma.profile.findMany({
      where: {
        hasLikedUser: true,
      },
      select: {
        id: true,
      },
      orderBy: {
        id: "asc",
      },
    }),

    prisma.profile.findMany({
      where: {
        hasLikedUser: false,
      },
      select: {
        id: true,
      },
      orderBy: {
        id: "asc",
      },
    }),
  ]);

  if (profileCount < 30) {
    throw new Error(
      `Expected at least 30 profiles, found ${profileCount}.`
    );
  }

  if (existingSwipeCount !== 0) {
    throw new Error(
      `Database is not fresh: found ${existingSwipeCount} existing swipes. ` +
      "Run npm run db:reset against your disposable test database."
    );
  }

  if (likers.length < 2 || nonLikers.length < 5) {
    throw new Error(
      "Seed requires at least 2 incoming likers and 5 non-likers."
    );
  }

  check(
    "Database contains at least 30 profiles",
    profileCount >= 30,
    profileCount
  );

  check(
    "Database contains incoming likers",
    likers.length >= 10,
    likers.length
  );

  console.log(`  Profiles: ${profileCount}`);
  console.log(`  Incoming likers: ${likers.length}`);
  console.log(`  Non-likers: ${nonLikers.length}\n`);

  const matchTarget = likers[0].id;
  const passLikerTarget = likers[1].id;

  const passTarget = nonLikers[0].id;
  const noMatchTarget = nonLikers[1].id;
  const aliasSwipeTarget = nonLikers[2].id;
  const raceTarget = nonLikers[3].id;
  const invalidTarget = nonLikers[4].id;

  const rawPayloads: string[] = [];

  /*
   * 2. Feed endpoints
   */

  console.log("Feed endpoints");

  const feed0 = await call("/api/feed");
  const aliasFeed = await call("/feed");

  rawPayloads.push(
    feed0.text,
    aliasFeed.text
  );

  check(
    "GET /api/feed returns 200",
    feed0.status === 200
  );

  check(
    "GET /feed alias returns 200",
    aliasFeed.status === 200 &&
    isPublicProfileArray(aliasFeed.body)
  );

  check(
    "GET /feed matches /api/feed",
    sameJson(aliasFeed.body, feed0.body)
  );

  if (!isPublicProfileArray(feed0.body)) {
    throw new Error(
      "GET /api/feed did not return a valid public profile array."
    );
  }

  check(
    "Feed returns valid profile cards",
    feed0.body.length > 0
  );

  check(
    "Feed contains all 30+ seeded profiles",
    feed0.body.length >= 30,
    feed0.body.length
  );

  const totalAtStart = feed0.body.length;

  check(
    "Feed contains exactly the seeded profile IDs",
    feed0.body.length === profileCount &&
    feed0.body.every((profile) =>
      [
        ...likers,
        ...nonLikers,
      ].some((item) => item.id === profile.id)
    )
  );

  /*
   * 3. PASS action
   */

  console.log("\nPASS action");

  const pass = await submitSwipe(
    "/api/swipe",
    passTarget,
    "PASS"
  );

  rawPayloads.push(pass.text);

  check(
    "PASS returns 200",
    pass.status === 200,
    pass.body
  );

  check(
    "PASS never creates a match",
    isObject(pass.body) &&
    pass.body.match === false,
    pass.body
  );

  /*
   * 4. LIKE without incoming like
   */

  console.log("\nLIKE without incoming like");

  const likeNo = await submitSwipe(
    "/api/swipe",
    noMatchTarget,
    "LIKE"
  );

  rawPayloads.push(likeNo.text);

  check(
    "LIKE on non-liker returns 200",
    likeNo.status === 200,
    likeNo.body
  );

  check(
    "One-sided LIKE returns match: false",
    isObject(likeNo.body) &&
    likeNo.body.match === false,
    likeNo.body
  );

  /*
   * 5. Mutual match
   */

  console.log("\nMutual matching");

  const likeYes = await submitSwipe(
    "/api/swipe",
    matchTarget,
    "LIKE"
  );

  rawPayloads.push(likeYes.text);

  check(
    "LIKE on incoming liker returns 200",
    likeYes.status === 200,
    likeYes.body
  );

  check(
    "Mutual LIKE creates match: true",
    isObject(likeYes.body) &&
    likeYes.body.match === true &&
    isPublicProfile(likeYes.body.profile) &&
    likeYes.body.profile.id === matchTarget,
    likeYes.body
  );

  /*
   * 6. PASS on incoming liker
   */

  const passLiker = await submitSwipe(
    "/api/swipe",
    passLikerTarget,
    "PASS"
  );

  rawPayloads.push(passLiker.text);

  check(
    "PASS on incoming liker never creates a match",
    passLiker.status === 200 &&
    isObject(passLiker.body) &&
    passLiker.body.match === false,
    passLiker.body
  );

  /*
   * 7. POST /swipe alias
   */

  console.log("\nPOST /swipe alias");

  const aliasSwipe = await submitSwipe(
    "/swipe",
    aliasSwipeTarget,
    "PASS"
  );

  rawPayloads.push(aliasSwipe.text);

  check(
    "POST /swipe alias returns 200",
    aliasSwipe.status === 200,
    aliasSwipe.body
  );

  check(
    "POST /swipe alias follows the original response contract",
    isObject(aliasSwipe.body) &&
    aliasSwipe.body.match === false,
    aliasSwipe.body
  );

  /*
   * 8. Duplicate protection
   */

  console.log("\nDuplicate swipe protection");

  const duplicate = await submitSwipe(
    "/api/swipe",
    matchTarget,
    "LIKE"
  );

  rawPayloads.push(duplicate.text);

  check(
    "Duplicate swipe returns 409",
    duplicate.status === 409 &&
    isObject(duplicate.body) &&
    duplicate.body.error === "Profile already swiped",
    duplicate.body
  );

  const duplicateAlias = await submitSwipe(
    "/swipe",
    aliasSwipeTarget,
    "LIKE"
  );

  rawPayloads.push(duplicateAlias.text);

  check(
    "Duplicate protection works across API aliases",
    duplicateAlias.status === 409,
    duplicateAlias.body
  );

  const duplicateFlip = await submitSwipe(
    "/api/swipe",
    passTarget,
    "LIKE"
  );

  rawPayloads.push(duplicateFlip.text);

  check(
    "Changing direction does not allow a second swipe",
    duplicateFlip.status === 409,
    duplicateFlip.body
  );

  /*
   * 9. Concurrent duplicate requests
   */

  console.log("\nConcurrent requests");

  const race = await Promise.all([
    submitSwipe(
      "/api/swipe",
      raceTarget,
      "LIKE"
    ),

    submitSwipe(
      "/swipe",
      raceTarget,
      "LIKE"
    ),

    submitSwipe(
      "/api/swipe",
      raceTarget,
      "PASS"
    ),
  ]);

  rawPayloads.push(
    ...race.map((result) => result.text)
  );

  const raceStatuses = race
    .map((result) => result.status)
    .sort((a, b) => a - b);

  check(
    "Concurrent requests produce exactly one success and two conflicts",
    raceStatuses.join(",") === "200,409,409",
    raceStatuses
  );

  /*
   * 10. Error handling and input validation
   */

  console.log("\nInput validation and errors");

  const unknown = await submitSwipe(
    "/api/swipe",
    "does-not-exist",
    "LIKE"
  );

  rawPayloads.push(unknown.text);

  check(
    "Unknown profile returns 404",
    unknown.status === 404,
    unknown.body
  );

  const badDirection = await submitSwipe(
    "/api/swipe",
    invalidTarget,
    "SUPERLIKE"
  );

  rawPayloads.push(badDirection.text);

  check(
    "Invalid direction returns 400",
    badDirection.status === 400,
    badDirection.body
  );

  const badBody = await call(
    "/api/swipe",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{not json",
    }
  );

  rawPayloads.push(badBody.text);

  check(
    "Malformed JSON returns 400",
    badBody.status === 400,
    badBody.body
  );

  /*
   * 11. Feed exclusion
   */

  console.log("\nFeed exclusion and persistence");

  const swipedIds = new Set([
    passTarget,
    noMatchTarget,
    matchTarget,
    passLikerTarget,
    aliasSwipeTarget,
    raceTarget,
  ]);

  const feed1 = await call("/api/feed");
  const aliasFeed1 = await call("/feed");

  rawPayloads.push(
    feed1.text,
    aliasFeed1.text
  );

  check(
    "GET /api/feed still returns 200",
    feed1.status === 200 &&
    isPublicProfileArray(feed1.body)
  );

  check(
    "All swiped profiles disappear from feed",
    isPublicProfileArray(feed1.body) &&
    feed1.body.every(
      (profile) => !swipedIds.has(profile.id)
    )
  );

  check(
    "Feed shrinks by exactly the number of accepted swipes",
    isPublicProfileArray(feed1.body) &&
    feed1.body.length ===
    totalAtStart - swipedIds.size,
    {
      expected: totalAtStart - swipedIds.size,
      actual: isPublicProfileArray(feed1.body)
        ? feed1.body.length
        : "Invalid response",
    }
  );

  check(
    "GET /feed alias remains synchronized",
    sameJson(aliasFeed1.body, feed1.body)
  );

  /*
   * 12. Matches endpoints
   */

  console.log("\nMatches endpoints");

  const matches = await call("/api/matches");
  const aliasMatches = await call("/matches");

  rawPayloads.push(
    matches.text,
    aliasMatches.text
  );

  check(
    "GET /api/matches returns 200",
    matches.status === 200 &&
    isPublicProfileArray(matches.body)
  );

  check(
    "GET /matches alias returns 200",
    aliasMatches.status === 200 &&
    isPublicProfileArray(aliasMatches.body)
  );

  check(
    "GET /matches returns the same results as /api/matches",
    sameJson(aliasMatches.body, matches.body)
  );

  check(
    "Only the confirmed mutual match appears",
    isPublicProfileArray(matches.body) &&
    matches.body.length === 1 &&
    matches.body[0].id === matchTarget,
    matches.body
  );

  /*
   * 13. Privacy checks
   */

  console.log("\nPrivacy checks");

  check(
    "No API response exposes hidden incoming-like information",
    rawPayloads.every(
      (payload) => !SECRET_FIELD_PATTERN.test(payload)
    )
  );

  check(
    "Every feed profile has exactly the public fields",
    hasOnlyPublicFields(feed0.body)
  );

  check(
    "Every remaining feed profile has exactly the public fields",
    hasOnlyPublicFields(feed1.body)
  );

  check(
    "Every match has exactly the public fields",
    hasOnlyPublicFields(matches.body)
  );

  check(
    "Matched profile in swipe response has only public fields",
    isObject(likeYes.body) &&
    hasOnlyPublicFields([likeYes.body.profile])
  );

  /*
   * 14. Database persistence
   */

  console.log("\nDatabase persistence");

  const persistedMatch = await prisma.swipe.findUnique({
    where: {
      profileId: matchTarget,
    },
    select: {
      direction: true,
    },
  });

  check(
    "Matching LIKE is stored in the database",
    persistedMatch?.direction === "LIKE",
    persistedMatch
  );

  const persistedMatchCount =
    await prisma.swipe.count({
      where: {
        profile: {
          hasLikedUser: true,
        },
        direction: "LIKE",
      },
    });

  check(
    "Database contains the expected mutual match",
    persistedMatchCount === 1,
    persistedMatchCount
  );

  /*
   * 15. Exhaust the deck
   */

  console.log("\nDeck exhaustion");

  if (!isPublicProfileArray(feed1.body)) {
    throw new Error(
      "Cannot exhaust deck: feed response was invalid."
    );
  }

  for (const profile of feed1.body) {
    const result = await submitSwipe(
      "/api/swipe",
      profile.id,
      "PASS"
    );

    if (result.status !== 200) {
      check(
        `Pass remaining profile ${profile.id}`,
        false,
        result.body
      );
    }
  }

  const feedEnd = await call("/api/feed");
  const aliasFeedEnd = await call("/feed");

  rawPayloads.push(
    feedEnd.text,
    aliasFeedEnd.text
  );

  check(
    "Exhausted feed returns 200 with an empty array",
    feedEnd.status === 200 &&
    Array.isArray(feedEnd.body) &&
    feedEnd.body.length === 0,
    feedEnd.body
  );

  check(
    "GET /feed alias also returns an empty array",
    aliasFeedEnd.status === 200 &&
    Array.isArray(aliasFeedEnd.body) &&
    aliasFeedEnd.body.length === 0
  );

  /*
   * 16. Match persistence after deck exhaustion
   */

  console.log("\nMatch persistence");

  const matchesEnd = await call("/api/matches");
  const aliasMatchesEnd = await call("/matches");

  rawPayloads.push(
    matchesEnd.text,
    aliasMatchesEnd.text
  );

  check(
    "Mutual match remains after exhausting the deck",
    isPublicProfileArray(matchesEnd.body) &&
    matchesEnd.body.length === 1 &&
    matchesEnd.body[0].id === matchTarget
  );

  check(
    "Matches alias remains synchronized after exhaustion",
    sameJson(
      aliasMatchesEnd.body,
      matchesEnd.body
    )
  );

  const finalSwipeCount =
    await prisma.swipe.count();

  check(
    "Every seeded profile has exactly one persisted swipe",
    finalSwipeCount === profileCount,
    {
      expected: profileCount,
      actual: finalSwipeCount,
    }
  );

  /*
   * 17. Final privacy check
   */

  check(
    "No hidden fields appear in any tested endpoint response",
    rawPayloads.every(
      (payload) => !SECRET_FIELD_PATTERN.test(payload)
    )
  );

  /*
   * Final summary
   */

  console.log("\n==================================");
  console.log(" API ACCEPTANCE TEST SUMMARY");
  console.log("==================================");

  console.log(`Total checks: ${totalChecks}`);
  console.log(`Passed:       ${totalChecks - failures}`);
  console.log(`Failed:       ${failures}`);

  if (failures === 0) {
    console.log("\nAll checks passed.");
  } else {
    console.error(
      `\n${failures} check(s) failed.`
    );
  }

  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((error: unknown) => {
    console.error("\nAPI test execution failed:");

    console.error(
      error instanceof Error
        ? error.message
        : error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
