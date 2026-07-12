import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export type Role = "patient" | "doctor" | "admin";

export async function requireRole(...allowedRoles: Role[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }

  return {
    error: null,
    session,
  };
}

export function checkOwnership(userId: string, sessionUserId: string): boolean {
  return userId === sessionUserId;
}
