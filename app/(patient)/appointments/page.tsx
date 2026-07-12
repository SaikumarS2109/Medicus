"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";

export default function PatientAppointmentsPage() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (session?.user.role !== "patient") {
      redirect("/dashboard");
    }
  }, [session]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments");
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAppointments();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Appointments</h1>
          <a
            href="/appointments/book"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Book New Appointment
          </a>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-lg">No appointments found</p>
        )}
      </div>
    </div>
  );
}
