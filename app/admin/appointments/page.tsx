"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (session?.user.role !== "admin") {
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

  let filtered = appointments;
  if (filter === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filtered = appointments.filter((a) => {
      const aptDate = new Date(a.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    });
  } else if (filter === "upcoming") {
    filtered = appointments.filter(
      (a) => new Date(a.appointmentDate) > new Date()
    );
  } else if (filter === "past") {
    filtered = appointments.filter(
      (a) => new Date(a.appointmentDate) < new Date()
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">All Appointments</h1>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("today")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "today"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "past"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300"
            }`}
          >
            Past
          </button>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((apt) => (
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
