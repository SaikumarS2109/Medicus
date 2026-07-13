"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const emptyForm = { doctorId: "", date: "", startTime: "", endTime: "", notes: "" };

export default function AdminSchedulePage() {
  const { data: session, status } = useSession();
  const [shifts, setShifts] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shiftError, setShiftError] = useState("");
  const [shiftData, setShiftData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShiftError("");
    setSubmitting(true);

    try {
      const isEditing = editingId !== null;
      const url = isEditing ? `/api/shifts/${editingId}` : "/api/shifts";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: shiftData.doctorId,
          date: shiftData.date,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          notes: shiftData.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to ${isEditing ? "update" : "create"} shift`);
      }

      const savedShift = await res.json();

      if (isEditing) {
        setShifts(shifts.map((s) => (s.id === editingId ? savedShift : s)));
        setEditingId(null);
      } else {
        setShifts([...shifts, savedShift]);
      }

      setShiftData(emptyForm);
    } catch (error) {
      setShiftError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (shift: any) => {
    setEditingId(shift.id);
    setShiftError("");
    setShiftData({
      doctorId: shift.doctorId,
      date: new Date(shift.date).toISOString().slice(0, 10),
      startTime: shift.startTime,
      endTime: shift.endTime,
      notes: shift.notes || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShiftError("");
    setShiftData(emptyForm);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/shifts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete shift");
      setShifts(shifts.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting shift:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || loading) return <PageLoader />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingShifts = shifts
    .filter((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <MainLayout topBarTitle="Staff Schedule">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
          {/* Create / Edit form */}
          <div className="card">
            <div className="card-header"><span className="card-title">{editingId ? "Edit Shift" : "Create Shift"}</span></div>
            <div className="card-body">
              {shiftError && (
                <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, fontSize: 13, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                  {shiftError}
                </div>
              )}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="form-label">Doctor *</label>
                  <select value={shiftData.doctorId} onChange={(e) => setShiftData({ ...shiftData, doctorId: e.target.value })}
                    required disabled={!!editingId} className="form-select" style={editingId ? { opacity: 0.5 } : {}}>
                    <option value="">Select doctor...</option>
                    {doctors.map((doc) => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Date *</label>
                  <input type="date" value={shiftData.date} onChange={(e) => setShiftData({ ...shiftData, date: e.target.value })}
                    required disabled={!!editingId} className="form-input" style={editingId ? { opacity: 0.5 } : {}} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label className="form-label">Start Time *</label>
                    <select value={shiftData.startTime} onChange={(e) => setShiftData({ ...shiftData, startTime: e.target.value, endTime: "" })}
                      required className="form-select">
                      <option value="">Start...</option>
                      {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">End Time *</label>
                    <select value={shiftData.endTime} onChange={(e) => setShiftData({ ...shiftData, endTime: e.target.value })}
                      required disabled={!shiftData.startTime} className="form-select" style={!shiftData.startTime ? { opacity: 0.5 } : {}}>
                      <option value="">End...</option>
                      {TIME_SLOTS.filter((slot) => slot > shiftData.startTime).map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Notes</label>
                  <textarea value={shiftData.notes} onChange={(e) => setShiftData({ ...shiftData, notes: e.target.value })}
                    rows={2} className="form-textarea" />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? (editingId ? "Saving..." : "Creating...") : (editingId ? "Save Changes" : "Create Shift")}
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleCancelEdit} className="btn-secondary">Cancel</button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Shift list */}
          <div className="card">
            <div className="card-header"><span className="card-title">Upcoming Shifts</span></div>
            <div>
              {upcomingShifts.length > 0 ? upcomingShifts.map((shift) => (
                <div key={shift.id} style={{
                  padding: "12px 20px", borderBottom: "1px solid #F8FAFC",
                  background: editingId === shift.id ? "#EFF6FF" : "transparent",
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{shift.doctor?.name || "Unknown Doctor"}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                      {new Date(shift.date).toLocaleDateString()} · {shift.startTime} – {shift.endTime}
                    </div>
                    {shift.notes && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{shift.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => handleEdit(shift)} disabled={!!editingId} className="btn-secondary" style={{ fontSize: 11 }}>Edit</button>
                    <button onClick={() => handleDelete(shift.id)} disabled={deletingId === shift.id || !!editingId}
                      style={{ fontSize: 11, padding: "6px 12px", borderRadius: 8, border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", cursor: "pointer", opacity: (deletingId === shift.id || !!editingId) ? 0.4 : 1 }}>
                      {deletingId === shift.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
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
