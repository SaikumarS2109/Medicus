import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const prescription = await db.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    const { status, refillsRemaining } = await req.json();

    // Patients can request refills (decrease refillsRemaining)
    // Doctors/admins can change status
    if (session!.user.role === "patient") {
      if (status || (refillsRemaining && refillsRemaining > 0)) {
        // Patient requesting refill
        const updated = await db.prescription.update({
          where: { id },
          data: {
            refillsRemaining: Math.max(0, (prescription.refillsRemaining || 0) - 1),
          },
          include: {
            patient: true,
            doctor: true,
          },
        });
        return NextResponse.json(updated);
      }
    } else {
      // Doctor/admin can update status and refills
      const updated = await db.prescription.update({
        where: { id },
        data: {
          status: status || prescription.status,
          refillsRemaining:
            refillsRemaining !== undefined
              ? refillsRemaining
              : prescription.refillsRemaining,
        },
        include: {
          patient: true,
          doctor: true,
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating prescription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
