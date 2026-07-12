import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: "doctor",
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
