"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

// 30-minute slots from 00:00 to 23:30
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export default function DoctorSchedulePage() {
  const { data: session, status } = useSession();
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingShift, setCreatingShift] = useState(false);
  const [shiftError, setShiftError] = useState("");
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
    if (status === "authenticated" && session?.user.role !== "doctor") {
      redirect("/dashboard");
    }
  }, [session, status]);

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
    setShiftError("");
    setCreatingShift(true);

    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: session?.user.id,
          date: shiftData.date,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          notes: shiftData.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create shift");
      }

      const newShift = await res.json();
      setShifts([...shifts, newShift]);
      setShiftData({ date: "", startTime: "", endTime: "", notes: "" });
    } catch (error) {
      setShiftError(error instanceof Error ? error.message : "Failed to create shift");
    } finally {
      setCreatingShift(false);
    }
  };

  if (status === "loading" || loading) return <PageLoader />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShifts = shifts
    .filter((s) => {
      const shiftDate = new Date(s.date);
      shiftDate.setHours(0, 0, 0, 0);
      return shiftDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <MainLayout topBarTitle="Schedule">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Add Shift</span></div>
            <div className="card-body">
              {shiftError && (
                <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, fontSize: 13, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                  {shiftError}
                </div>
              )}
              <form onSubmit={handleCreateShift} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="form-label">Date *</label>
                  <input type="date" value={shiftData.date} onChange={(e) => setShiftData({ ...shiftData, date: e.target.value })} required className="form-input" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label className="form-label">Start Time *</label>
                    <select value={shiftData.startTime} onChange={(e) => setShiftData({ ...shiftData, startTime: e.target.value, endTime: "" })} required className="form-select">
                      <option value="">Select start...</option>
                      {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">End Time *</label>
                    <select value={shiftData.endTime} onChange={(e) => setShiftData({ ...shiftData, endTime: e.target.value })} required disabled={!shiftData.startTime} className="form-select" style={!shiftData.startTime ? { opacity: 0.5 } : {}}>
                      <option value="">Select end...</option>
                      {TIME_SLOTS.filter((slot) => slot > shiftData.startTime).map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Notes</label>
                  <textarea value={shiftData.notes} onChange={(e) => setShiftData({ ...shiftData, notes: e.target.value })} rows={3} className="form-textarea" />
                </div>
                <button type="submit" disabled={creatingShift} className="btn-primary">
                  {creatingShift ? "Creating..." : "Add Shift"}
                </button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Upcoming Shifts</span></div>
            <div>
              {upcomingShifts.length > 0 ? upcomingShifts.map((shift) => (
                <div key={shift.id} style={{ padding: "12px 20px", borderBottom: "1px solid #F8FAFC" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>
                    {new Date(shift.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                    {shift.startTime} – {shift.endTime}
                  </div>
                  {shift.notes && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{shift.notes}</div>}
                </div>
              )) : (
                <div style={{ padding: "24px 20px", color: "#94A3B8", fontSize: 13 }}>No upcoming shifts</div>
              )}
            </div>
          </div>
        </div>
    </MainLayout>
  );
}
