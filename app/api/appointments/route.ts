import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    let appointments;

    if (session!.user.role === "patient") {
      // Patient sees only their appointments
      const patient = await db.patient.findUnique({
        where: { userId: session!.user.id },
      });

      appointments = await db.appointment.findMany({
        where: { patientId: patient?.id },
        include: {
          patient: true,
          doctor: true,
        },
        orderBy: { appointmentDate: "asc" },
      });
    } else if (session!.user.role === "doctor") {
      // Doctor sees appointments they're assigned to
      appointments = await db.appointment.findMany({
        where: { doctorId: session!.user.id },
        include: {
          patient: true,
          doctor: true,
        },
        orderBy: { appointmentDate: "asc" },
      });
    } else {
      // Admin sees all appointments
      appointments = await db.appointment.findMany({
        include: {
          patient: true,
          doctor: true,
        },
        orderBy: { appointmentDate: "asc" },
      });
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const { patientId, doctorId, appointmentDate, duration, reason } =
      await req.json();

    if (!patientId || !doctorId || !appointmentDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Patient can only book for themselves
    if (session!.user.role === "patient") {
      const patient = await db.patient.findUnique({
        where: { userId: session!.user.id },
      });
      if (patient?.id !== patientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const appointment = await db.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        duration: duration || 30,
        reason,
        createdBy: session!.user.id,
        status: "scheduled",
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
