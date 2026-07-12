import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        user: true,
        appointments: {
          include: { doctor: true },
          orderBy: { appointmentDate: "desc" },
        },
        prescriptions: {
          include: { doctor: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Access control
    if (session!.user.role === "patient") {
      if (patient.userId !== session!.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session!.user.role === "doctor") {
      // Doctor can view patients they have appointments with
      const hasAppointment = await db.appointment.findFirst({
        where: {
          patientId: patient.id,
          doctorId: session!.user.id,
        },
      });

      if (!hasAppointment) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const patient = await db.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Patient can only edit their own record
    if (session!.user.role === "patient") {
      if (patient.userId !== session!.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const {
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      medicalHistory,
      insurance,
      emergencyContact,
      profilePictureUrl,
    } = await req.json();

    const updated = await db.patient.update({
      where: { id },
      data: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        bloodType,
        allergies,
        medicalHistory,
        insurance,
        emergencyContact,
        profilePictureUrl,
      },
      include: {
        user: true,
        appointments: true,
        prescriptions: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
