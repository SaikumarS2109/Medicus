"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default function DoctorSchedulePage() {
  const { data: session, status } = useSession();
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingShift, setCreatingShift] = useState(false);
  const [shiftData, setShiftData] = useState({
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
    if (session?.user.role !== "doctor") {
      redirect("/dashboard");
    }
  }, [session]);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await fetch("/api/shifts");
        const data = await res.json();
        // Filter for current doctor's shifts
        const doctorShifts = data.filter((s: any) => s.doctorId === session?.user.id);
        setShifts(doctorShifts);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchShifts();
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Schedule</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Add Shift</h2>
            <form onSubmit={handleCreateShift} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
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
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={creatingShift}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingShift ? "Creating..." : "Add Shift"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Upcoming Shifts</h2>
            {upcomingShifts.length > 0 ? (
              <div className="space-y-4">
                {upcomingShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <p className="font-semibold">
                      {new Date(shift.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {shift.startTime} - {shift.endTime}
                    </p>
                    {shift.notes && (
                      <p className="text-sm text-gray-600 mt-2">{shift.notes}</p>
                    )}
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
