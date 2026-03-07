import { NextResponse } from "next/server";
import { getSession, TokenPayload } from "./auth";

export function success(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withAuth(
  allowedRoles: string[] | null,
  handler: (session: TokenPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return error("Unauthorized", 401);
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return error("Forbidden", 403);
    }
    return await handler(session);
  } catch (err) {
    console.error(err);
    return error("Internal server error", 500);
  }
}
