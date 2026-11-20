import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiError } from "@/types/profile";

/** An error that maps directly to an HTTP status and a client-safe message. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const NO_STORE = { "Cache-Control": "no-store" } as const;

export function json<T>(body: T, status = 200): NextResponse<T> {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/**
 * Wraps a route handler so every failure becomes a consistent `{ error }` JSON body.
 * Unknown errors are logged server-side and reported as a generic 500 (no internals leak).
 */
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof HttpError) {
      return json<ApiError>({ error: err.message }, err.status);
    }
    if (err instanceof ZodError) {
      const message = err.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ");
      return json<ApiError>({ error: message }, 400);
    }
    console.error("[api] unhandled error:", err);
    return json<ApiError>({ error: "Internal server error" }, 500);
  }
}
