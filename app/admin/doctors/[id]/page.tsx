"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";
import PageLoader from "@/components/shared/PageLoader";

export default function AdminDoctorDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editData, setEditData] = useState({ name: "", specialty: "", phone: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "admin") {
      redirect("/dashboard");
    }
  }, [session, status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, appointmentsRes, shiftsRes] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/appointments"),
          fetch("/api/shifts"),
        ]);

        const doctors = await doctorsRes.json();
        setDoctor(doctors.find((d: any) => d.id === doctorId) ?? null);

        const allAppointments = await appointmentsRes.json();
        setAppointments(allAppointments.filter((a: any) => a.doctorId === doctorId));

        const allShifts = await shiftsRes.json();
        setShifts(allShifts.filter((s: any) => s.doctorId === doctorId));
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, doctorId]);

  const startEditing = () => {
    setEditData({ name: doctor.name || "", specialty: doctor.specialty || "", phone: doctor.phone || "" });
    setSaveError("");
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/doctors/${doctorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const updated = await res.json();
      setDoctor({ ...doctor, ...updated });
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) return <PageLoader />;

  if (!doctor) {
    return <div className="p-8">Doctor not found</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShifts = shifts
    .filter((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingAppointments = appointments
    .filter((a) => new Date(a.appointmentDate) >= new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        <a href="/admin/users" className="text-blue-600 hover:underline text-sm">
          ← Back to Users
        </a>

        {/* Doctor profile */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold">{doctor.name}</h1>
              <p className="text-gray-500">{doctor.specialty || "No specialty listed"}</p>
            </div>
            {!editing && (
              <button onClick={startEditing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Edit Profile
              </button>
            )}
          </div>

          {!editing ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Email:</strong> {doctor.email}</div>
              <div><strong>Phone:</strong> {doctor.phone || "Not provided"}</div>
              <div><strong>Specialty:</strong> {doctor.specialty || "Not specified"}</div>
              <div><strong>Total Appointments:</strong> {appointments.length}</div>
              <div><strong>Upcoming Shifts:</strong> {upcomingShifts.length}</div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              {saveError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{saveError}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input type="text" value={editData.name} required
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialty</label>
                  <input type="text" value={editData.specialty}
                    onChange={(e) => setEditData({ ...editData, specialty: e.target.value })}
                    placeholder="e.g., Cardiology"
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="text" value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming appointments */}
          <div className="bg-white rounded-lg shadow-md p-8">
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
          </div>

          {/* Upcoming shifts */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Upcoming Shifts</h2>
            {upcomingShifts.length > 0 ? (
              <div className="space-y-3">
                {upcomingShifts.map((shift) => (
                  <div key={shift.id} className="p-4 border rounded-lg bg-gray-50">
                    <p className="font-semibold">{new Date(shift.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{shift.startTime} – {shift.endTime}</p>
                    {shift.notes && <p className="text-sm text-gray-500 mt-1">{shift.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No upcoming shifts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
