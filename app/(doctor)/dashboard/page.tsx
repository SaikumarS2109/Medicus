"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";
import ProfileCard from "@/components/shared/ProfileCard";

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated" && session?.user.role !== "doctor") {
      redirect("/");
    }
  }, [status, session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsRes = await fetch("/api/appointments");
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);

        const patientsRes = await fetch("/api/patients");
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(today);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const todayAppointments = appointments.filter((a) => {
    const aptDate = new Date(a.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Welcome, Dr. {session?.user.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Today's Appointments</h2>
          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No appointments today</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Your Patients</h2>
          {patients.length > 0 ? (
            <div className="space-y-4">
              {patients.slice(0, 5).map((patient) => (
                <div key={patient.id}>
                  <ProfileCard
                    name={patient.user?.name || "Unknown"}
                    email={patient.user?.email}
                  />
                  <a
                    href={`/patients/${patient.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Full Record
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No patients yet</p>
          )}
        </section>
      </div>

      <section className="mt-8">
        <a
          href="/prescriptions"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Manage Prescriptions
        </a>
      </section>
    </div>
  );
}
