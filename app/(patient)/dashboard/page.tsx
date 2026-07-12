"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";
import PrescriptionCard from "@/components/shared/PrescriptionCard";

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated" && session?.user.role !== "patient") {
      redirect("/");
    }
  }, [status, session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientRes = await fetch("/api/patients", {
          method: "GET",
        });
        const patientData = await patientRes.json();

        if (patientData.length > 0) {
          const patient = patientData[0];
          setPatient(patient);

          const appointmentsRes = await fetch(`/api/appointments`);
          const appointmentsData = await appointmentsRes.json();
          setAppointments(appointmentsData);

          const prescriptionsRes = await fetch(`/api/prescriptions`);
          const prescriptionsData = await prescriptionsRes.json();
          setPrescriptions(prescriptionsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.appointmentDate) > new Date() && a.status === "scheduled"
  );

  const activeRx = prescriptions.filter((p) => p.status === "active");

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {session?.user.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming appointments</p>
          )}
          <a
            href="/appointments/book"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Book Appointment
          </a>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Active Prescriptions</h2>
          {activeRx.length > 0 ? (
            <div className="space-y-4">
              {activeRx.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No active prescriptions</p>
          )}
        </section>
      </div>

      {patient && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Medical Record</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p>
              <strong>DOB:</strong> {patient.dateOfBirth || "Not provided"}
            </p>
            <p>
              <strong>Blood Type:</strong> {patient.bloodType || "Not provided"}
            </p>
            <p>
              <strong>Allergies:</strong> {patient.allergies || "None listed"}
            </p>
            <p>
              <strong>Medical History:</strong>{" "}
              {patient.medicalHistory || "None listed"}
            </p>
            <a
              href="/profile"
              className="mt-4 inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Edit Profile
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
