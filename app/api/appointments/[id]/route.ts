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
    const appointment = await db.appointment.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const appointment = await db.appointment.findUnique({
      where: { id },
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

    const { status, notes, bloodPressure, heartRate, temperature, weight, oxygenSaturation, appointmentDate, doctorId } = await req.json();

    const isAssignedDoctor = session!.user.role === "doctor" && appointment.doctorId === session!.user.id;
    const isAdmin = session!.user.role === "admin";
    const isPatient = session!.user.role === "patient";

    // Patients can only reschedule their own appointments
    if (isPatient) {
      const patient = await db.patient.findUnique({ where: { userId: session!.user.id } });
      if (appointment.patientId !== patient?.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!appointmentDate) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const hoursUntil = (new Date(appointment.appointmentDate).getTime() - Date.now()) / 3_600_000;
      if (hoursUntil < 24) {
        return NextResponse.json({ error: "Cannot reschedule within 24 hours of the appointment" }, { status: 400 });
      }
      // Overlap check for new slot
      const newStart = new Date(appointmentDate);
      const thirtyMin = 30 * 60 * 1000;
      const overlapping = await db.appointment.findFirst({
        where: {
          doctorId: appointment.doctorId,
          status: { not: "cancelled" },
          id: { not: id },
          appointmentDate: {
            gt: new Date(newStart.getTime() - thirtyMin),
            lt: new Date(newStart.getTime() + thirtyMin),
          },
        },
      });
      if (overlapping) {
        return NextResponse.json({ error: "That time slot is already booked. Please choose a different time." }, { status: 409 });
      }
      const updated = await db.appointment.update({
        where: { id },
        data: { appointmentDate: newStart },
        include: { patient: true, doctor: true },
      });
      return NextResponse.json(updated);
    }

    if (!isAssignedDoctor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Admin can reassign to a different doctor
    if (isAdmin && doctorId !== undefined && doctorId !== appointment.doctorId) {
      const newStart = new Date(appointment.appointmentDate);
      const thirtyMin = 30 * 60 * 1000;
      const overlapping = await db.appointment.findFirst({
        where: {
          doctorId,
          status: { not: "cancelled" },
          id: { not: id },
          appointmentDate: {
            gt: new Date(newStart.getTime() - thirtyMin),
            lt: new Date(newStart.getTime() + thirtyMin),
          },
        },
      });
      if (overlapping) {
        return NextResponse.json(
          { error: "That doctor already has an appointment at this time." },
          { status: 409 }
        );
      }
    }

    const updated = await db.appointment.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(bloodPressure !== undefined && { bloodPressure }),
        ...(heartRate !== undefined && { heartRate }),
        ...(temperature !== undefined && { temperature }),
        ...(weight !== undefined && { weight }),
        ...(oxygenSaturation !== undefined && { oxygenSaturation }),
        ...(isAdmin && doctorId !== undefined && { doctorId }),
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    const appointment = await db.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (session!.user.role === "patient") {
      const patient = await db.patient.findUnique({ where: { userId: session!.user.id } });
      if (appointment.patientId !== patient?.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const hoursUntil = (new Date(appointment.appointmentDate).getTime() - Date.now()) / 3_600_000;
      if (hoursUntil < 24) {
        return NextResponse.json({ error: "Cannot cancel within 24 hours of the appointment" }, { status: 400 });
      }
    }

    await db.appointment.update({ where: { id }, data: { status: "cancelled" } });

    return NextResponse.json({ message: "Appointment cancelled" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
