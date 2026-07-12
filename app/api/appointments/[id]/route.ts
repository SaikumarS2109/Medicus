import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const appointment = await db.appointment.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Role-based access check
    if (session!.user.role === "patient") {
      const patient = await db.patient.findUnique({
        where: { userId: session!.user.id },
      });
      if (appointment.patientId !== patient?.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session!.user.role === "doctor") {
      if (appointment.doctorId !== session!.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const appointment = await db.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Only doctor and admin can edit appointments
    if (
      session!.user.role === "doctor" &&
      appointment.doctorId !== session!.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, notes } = await req.json();

    const updated = await db.appointment.update({
      where: { id: params.id },
      data: {
        status: status || appointment.status,
        notes: notes !== undefined ? notes : appointment.notes,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const appointment = await db.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Patients can cancel their own, doctors/admins can cancel any
    if (session!.user.role === "patient") {
      const patient = await db.patient.findUnique({
        where: { userId: session!.user.id },
      });
      if (appointment.patientId !== patient?.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    await db.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Appointment cancelled" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
