import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, session } = await requireRole("admin");
  if (error) return error;

  try {
    const { startTime, endTime, notes } = await req.json();

    // Fetch the existing shift to get doctorId and date for overlap check
    const existing = await db.staffShift.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    const dayStart = new Date(existing.date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const siblings = await db.staffShift.findMany({
      where: { doctorId: existing.doctorId, date: { gte: dayStart, lt: dayEnd }, id: { not: id } },
    });

    const overlapping = siblings.find(
      (s) => startTime < s.endTime && endTime > s.startTime
    );

    if (overlapping) {
      return NextResponse.json(
        { error: `Overlaps with an existing shift (${overlapping.startTime}–${overlapping.endTime}).` },
        { status: 409 }
      );
    }

    const shift = await db.staffShift.update({
      where: { id },
      data: { startTime, endTime, notes },
      include: { doctor: true },
    });

    return NextResponse.json(shift);
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, session } = await requireRole("admin");
  if (error) return error;

  try {
    await db.staffShift.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Shift deleted" });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
