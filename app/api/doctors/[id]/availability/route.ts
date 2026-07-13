import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shifts = await db.staffShift.findMany({
      where: { doctorId: id, date: { gte: today } },
      orderBy: { date: "asc" },
    });

    // Return shifts with normalised date strings so clients can build pickers
    const availability = shifts.map((s) => ({
      date: s.date.toISOString().slice(0, 10),
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
