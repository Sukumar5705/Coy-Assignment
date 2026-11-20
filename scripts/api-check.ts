/**
 * End-to-end check of the API against the PRD acceptance criteria.
 *
 * Usage:
 *   npm run db:reset        # fresh seeded DB
 *   npm run dev             # in another terminal
 *   npm run test:api        # BASE_URL defaults to http://localhost:3000
 *
 * It needs to know which seeded profiles secretly like the demo user. That flag is
 * (correctly) not exposed by the API, so this script reads it straight from the database.
 */
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const prisma = new PrismaClient();

let failures = 0;
function check(label: string, ok: boolean, detail?: unknown) {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${label}`, detail !== undefined ? JSON.stringify(detail) : "");
  }
}

async function call(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, init);
  const text = await res.text();
  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    // leave body null
  }
  return { status: res.status, text, body: body as any };
}

const swipe = (profileId: string, direction: string) =>
  call("/api/swipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId, direction }),
  });

async function main() {
  const liker = await prisma.profile.findFirstOrThrow({ where: { hasLikedUser: true } });
  const likers = await prisma.profile.findMany({ where: { hasLikedUser: true }, select: { id: true } });
  const nonLikers = await prisma.profile.findMany({ where: { hasLikedUser: false }, select: { id: true } });

  console.log("Feed");
  const feed0 = await call("/api/feed");
  check("1. feed returns 200 with profile cards", feed0.status === 200 && feed0.body.length > 0);
  const totalAtStart = feed0.body.length;
  check("feed has 30+ profiles", totalAtStart >= 30, totalAtStart);

  console.log("Pass");
  const passTarget = nonLikers[0].id;
  const pass = await swipe(passTarget, "PASS");
  check("3. PASS returns 200 { match: false }", pass.status === 200 && pass.body.match === false, pass.body);

  console.log("Like (no incoming like)");
  const noMatchTarget = nonLikers[1].id;
  const likeNo = await swipe(noMatchTarget, "LIKE");
  check("5. LIKE on non-liker returns { match: false }", likeNo.status === 200 && likeNo.body.match === false, likeNo.body);

  console.log("Like (incoming like -> match)");
  const likeYes = await swipe(liker.id, "LIKE");
  check("4. LIKE on liker returns match: true with profile", likeYes.status === 200 && likeYes.body.match === true && likeYes.body.profile?.id === liker.id, likeYes.body);

  console.log("PASS on a liker never matches");
  const passLiker = await swipe(likers[1].id, "PASS");
  check("PASS on a liker returns { match: false }", passLiker.status === 200 && passLiker.body.match === false, passLiker.body);

  console.log("Duplicate / errors");
  const dup = await swipe(liker.id, "LIKE");
  check("8. duplicate swipe is rejected with 409", dup.status === 409 && dup.body.error === "Profile already swiped", dup);
  const dupFlip = await swipe(passTarget, "LIKE");
  check("8b. re-swiping with a different direction is still 409", dupFlip.status === 409, dupFlip);
  const race = await Promise.all([swipe(nonLikers[2].id, "LIKE"), swipe(nonLikers[2].id, "LIKE"), swipe(nonLikers[2].id, "PASS")]);
  const raceStatuses = race.map((r) => r.status).sort();
  check("8c. concurrent swipes: exactly one succeeds, rest 409", raceStatuses.join() === "200,409,409", raceStatuses);
  const unknown = await swipe("does-not-exist", "LIKE");
  check("unknown profile returns 404", unknown.status === 404, unknown);
  const badDir = await swipe(nonLikers[3].id, "SUPERLIKE");
  check("invalid direction returns 400", badDir.status === 400, badDir);
  const badBody = await call("/api/swipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{not json" });
  check("malformed JSON returns 400", badBody.status === 400, badBody);

  console.log("Persistence / feed shrinks");
  const feed1 = await call("/api/feed");
  const swiped = new Set([passTarget, noMatchTarget, liker.id, likers[1].id, nonLikers[2].id]);
  check("2/6. swiped profiles are gone from the feed", feed1.body.every((p: any) => !swiped.has(p.id)));
  check("feed shrank by exactly the number of swipes", feed1.body.length === totalAtStart - swiped.size, feed1.body.length);

  console.log("Matches");
  const matches = await call("/api/matches");
  check("7. matches contains exactly the one mutual match", matches.status === 200 && matches.body.length === 1 && matches.body[0].id === liker.id, matches.body);

  console.log("Privacy");
  const secret = /hasLikedUser|likedUser|likesYou/i;
  const rawPayloads = [feed0.text, feed1.text, matches.text, likeYes.text, likeNo.text, pass.text, dup.text];
  check("10. no hidden flag appears in any raw response", rawPayloads.every((t) => !secret.test(t)));
  const allowed = ["id", "name", "age", "photo", "bio", "location", "interests"].sort().join();
  check("every feed profile has exactly the public fields", feed1.body.every((p: any) => Object.keys(p).sort().join() === allowed));

  console.log("Exhaust the deck");
  for (const p of feed1.body as { id: string }[]) {
    await swipe(p.id, "PASS");
  }
  const feedEnd = await call("/api/feed");
  check("9. exhausted feed is 200 with an empty array", feedEnd.status === 200 && Array.isArray(feedEnd.body) && feedEnd.body.length === 0, feedEnd.body);
  const matchesEnd = await call("/api/matches");
  check("matches unchanged after passing everyone else", matchesEnd.body.length === 1);

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
