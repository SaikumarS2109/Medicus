import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { error, session } = await requireRole("doctor", "admin");
  if (error) return error;

  try {
    let shifts;

    if (session!.user.role === "doctor") {
      // Doctor sees only their own shifts
      shifts = await db.staffShift.findMany({
        where: { doctorId: session!.user.id },
        include: { doctor: true },
        orderBy: { date: "asc" },
      });
    } else {
      // Admin sees all shifts
      shifts = await db.staffShift.findMany({
        include: { doctor: true },
        orderBy: { date: "asc" },
      });
    }

    return NextResponse.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole("doctor", "admin");
  if (error) return error;

  try {
    const { doctorId, date, startTime, endTime, notes } = await req.json();

    if (!doctorId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Doctor can only create shifts for themselves
    if (session!.user.role === "doctor" && doctorId !== session!.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const shift = await db.staffShift.create({
      data: {
        doctorId,
        date: new Date(date),
        startTime,
        endTime,
        notes,
      },
      include: { doctor: true },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
