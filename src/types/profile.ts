/**
 * Shared profile and API types for the frontend and backend.
 * The internal hasLikedUser database flag is intentionally not part of PublicProfile.
 */

export type SwipeDirection = "LIKE" | "PASS";

export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string[];
}

/** Frontend alias for the public API profile shape. */
export type Profile = PublicProfile;

export interface SwipeRequest {
  profileId: string;
  direction: SwipeDirection;
}

export type SwipeResponse =
  | { match: true; profile: PublicProfile }
  | { match: false };

/** Frontend name for the same swipe API response. */
export type SwipeResult = SwipeResponse;

export interface ApiError {
  error: string;
}
