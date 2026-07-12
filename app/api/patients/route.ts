import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { error, session } = await requireRole("doctor", "admin");
  if (error) return error;

  try {
    let patients;

    if (session!.user.role === "doctor") {
      // Doctor sees patients they have appointments with
      const appointments = await db.appointment.findMany({
        where: { doctorId: session!.user.id },
        select: { patientId: true },
        distinct: ["patientId"],
      });

      const patientIds = appointments.map((a) => a.patientId);

      patients = await db.patient.findMany({
        where: { id: { in: patientIds } },
        include: { user: true },
      });
    } else {
      // Admin sees all patients
      patients = await db.patient.findMany({
        include: { user: true },
      });
    }

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
