"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default function AdminSchedulePage() {
  const { data: session, status } = useSession();
  const [shifts, setShifts] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingShift, setCreatingShift] = useState(false);
  const [shiftData, setShiftData] = useState({
    doctorId: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

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
    const fetchData = async () => {
      try {
        const shiftsRes = await fetch("/api/shifts");
        const shiftsData = await shiftsRes.json();
        setShifts(shiftsData);

        const doctorsRes = await fetch("/api/doctors");
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData);
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

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingShift(true);

    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: shiftData.doctorId,
          date: new Date(shiftData.date),
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          notes: shiftData.notes,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create shift");
      }

      const newShift = await res.json();
      setShifts([...shifts, newShift]);
      setShiftData({
        doctorId: "",
        date: "",
        startTime: "",
        endTime: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating shift:", error);
    } finally {
      setCreatingShift(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  const upcomingShifts = shifts
    .filter((s) => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Staff Schedule Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Create Shift</h2>
            <form onSubmit={handleCreateShift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Doctor *
                </label>
                <select
                  value={shiftData.doctorId}
                  onChange={(e) =>
                    setShiftData({ ...shiftData, doctorId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select doctor...</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={shiftData.date}
                  onChange={(e) =>
                    setShiftData({ ...shiftData, date: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={shiftData.startTime}
                    onChange={(e) =>
                      setShiftData({ ...shiftData, startTime: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={shiftData.endTime}
                    onChange={(e) =>
                      setShiftData({ ...shiftData, endTime: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={shiftData.notes}
                  onChange={(e) =>
                    setShiftData({ ...shiftData, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={creatingShift}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingShift ? "Creating..." : "Create Shift"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Upcoming Shifts</h2>
            {upcomingShifts.length > 0 ? (
              <div className="space-y-3">
                {upcomingShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {shift.doctor?.name || "Unknown Doctor"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(shift.date).toLocaleDateString()} |{" "}
                          {shift.startTime} - {shift.endTime}
                        </p>
                        {shift.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            {shift.notes}
                          </p>
                        )}
                      </div>
                    </div>
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
