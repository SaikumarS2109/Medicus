"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";
import PrescriptionCard from "@/components/shared/PrescriptionCard";
import ProfileCard from "@/components/shared/ProfileCard";

export default function DashboardRouter() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user.role === "patient") {
          const patientRes = await fetch("/api/patients", { method: "GET" });
          const patientData = await patientRes.json();

          if (patientData.length > 0) {
            const patientInfo = patientData[0];
            setPatient(patientInfo);

            const appointmentsRes = await fetch("/api/appointments");
            const appointmentsData = await appointmentsRes.json();
            setAppointments(appointmentsData);

            const prescriptionsRes = await fetch("/api/prescriptions");
            const prescriptionsData = await prescriptionsRes.json();
            setPrescriptions(prescriptionsData);
          }
        } else if (session?.user.role === "doctor") {
          const appointmentsRes = await fetch("/api/appointments");
          const appointmentsData = await appointmentsRes.json();
          setAppointments(appointmentsData);

          const patientsRes = await fetch("/api/patients");
          const patientsData = await patientsRes.json();
          setPatients(patientsData);
        } else if (session?.user.role === "admin") {
          const appointmentsRes = await fetch("/api/appointments");
          const appointmentsData = await appointmentsRes.json();
          setAppointments(appointmentsData);

          const shiftsRes = await fetch("/api/shifts");
          const shiftsData = await shiftsRes.json();
          setShifts(shiftsData);
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

  if (!session?.user.role) {
    redirect("/login");
  }

  // Patient Dashboard
  if (session.user.role === "patient") {
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

  // Doctor Dashboard
  if (session.user.role === "doctor") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
                {patients.slice(0, 5).map((p) => (
                  <div key={p.id}>
                    <ProfileCard
                      name={p.user?.name || "Unknown"}
                      email={p.user?.email}
                    />
                    <a
                      href={`/patients/${p.id}`}
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
            href="/my-prescriptions"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Manage Prescriptions
          </a>
        </section>
      </div>
    );
  }

  // Admin Dashboard
  if (session.user.role === "admin") {
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

  return <div className="p-8">Unauthorized</div>;
}
