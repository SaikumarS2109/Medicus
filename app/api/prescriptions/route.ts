import { db } from "@/lib/db";
import { requireRole } from "@/app/api/utils/roleCheck";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { error, session } = await requireRole("patient", "doctor", "admin");
  if (error) return error;

  try {
    let prescriptions;

    if (session!.user.role === "patient") {
      // Patient sees only their prescriptions
      const patient = await db.patient.findUnique({
        where: { userId: session!.user.id },
      });

      prescriptions = await db.prescription.findMany({
        where: { patientId: patient?.id },
        include: {
          patient: true,
          doctor: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (session!.user.role === "doctor") {
      // Doctor sees prescriptions they created
      prescriptions = await db.prescription.findMany({
        where: { doctorId: session!.user.id },
        include: {
          patient: true,
          doctor: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Admin sees all prescriptions
      prescriptions = await db.prescription.findMany({
        include: {
          patient: true,
          doctor: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole("doctor", "admin");
  if (error) return error;

  try {
    const {
      patientId,
      medication,
      dosage,
      frequency,
      startDate,
      endDate,
      refillsRemaining,
    } = await req.json();

    if (!patientId || !medication || !dosage || !frequency || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prescription = await db.prescription.create({
      data: {
        patientId,
        doctorId: session!.user.id,
        medication,
        dosage,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        refillsRemaining: refillsRemaining || 3,
        status: "active",
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
