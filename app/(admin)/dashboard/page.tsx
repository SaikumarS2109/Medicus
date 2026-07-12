"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated" && session?.user.role !== "admin") {
      redirect("/");
    }
  }, [status, session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsRes = await fetch("/api/appointments");
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);

        const shiftsRes = await fetch("/api/shifts");
        const shiftsData = await shiftsRes.json();
        setShifts(shiftsData);
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

  const todayAppointments = appointments.filter((a) => {
    const aptDate = new Date(a.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime();
  });

  const staffOnDuty = shifts.filter((s) => {
    const shiftDate = new Date(s.date);
    shiftDate.setHours(0, 0, 0, 0);
    return shiftDate.getTime() === today.getTime();
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Today's Appointments</h3>
          <p className="text-3xl font-bold text-blue-600">{todayAppointments.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Staff On Duty</h3>
          <p className="text-3xl font-bold text-green-600">{staffOnDuty.length}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Total Appointments</h3>
          <p className="text-3xl font-bold text-yellow-600">{appointments.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/admin/schedule"
              className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Manage Staff Schedule
            </a>
            <a
              href="/admin/users"
              className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Manage Users
            </a>
            <a
              href="/admin/appointments"
              className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Appointments
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Today's Appointments</h2>
          {todayAppointments.length > 0 ? (
            <div className="space-y-2">
              {todayAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 border rounded-lg bg-gray-50"
                >
                  <p className="font-semibold">
                    {apt.patient?.user?.name} → {apt.doctor?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(apt.appointmentDate).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No appointments today</p>
          )}
        </section>
      </div>
    </div>
  );
}
