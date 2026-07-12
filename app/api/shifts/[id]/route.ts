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

    const shift = await db.staffShift.update({
      where: { id },
      data: {
        startTime: startTime,
        endTime: endTime,
        notes: notes,
      },
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
