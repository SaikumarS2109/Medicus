import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireRole("admin");
  if (error) return error;

  try {
    const { name, specialty, phone } = await req.json();

    const doctor = await db.user.findUnique({ where: { id, role: "doctor" } });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(specialty !== undefined && { specialty }),
        ...(phone !== undefined && { phone }),
      },
      select: { id: true, name: true, email: true, specialty: true, phone: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating doctor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
