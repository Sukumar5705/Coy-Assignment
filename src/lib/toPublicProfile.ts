import type { Profile } from "@prisma/client";
import type { PublicProfile } from "@/types/profile";
import { decodeInterests } from "@/lib/interests";

/**
 * The columns a client may ever see. Queries that only feed the serializer
 * should `select` exactly these so internal columns are never even loaded.
 */
export const publicProfileSelect = {
  id: true,
  name: true,
  age: true,
  photo: true,
  bio: true,
  location: true,
  interests: true,
} as const;

/** Accepts a full Profile row or any row that carries at least the public columns. */
export type PublicProfileSource = Pick<
  Profile,
  "id" | "name" | "age" | "photo" | "bio" | "location" | "interests"
>;

/**
 * THE serialization boundary.
 *
 * This is the only function that turns a Profile row into something sent to a client.
 * It builds the output from an explicit allow-list, so `hasLikedUser` (and any column
 * added to the model later) is dropped unconditionally. Routes must never hand-pick fields.
 */
export function toPublicProfile(row: PublicProfileSource): PublicProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo,
    bio: row.bio,
    location: row.location,
    interests: decodeInterests(row.interests),
  };
}
