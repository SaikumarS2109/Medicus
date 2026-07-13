"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

const FILTERS = ["all", "today", "upcoming", "past", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

export default function AdminAppointmentsPage() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  // Per-appointment action state
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [newDoctorId, setNewDoctorId] = useState("");
  const [reassigning, setReassigning] = useState(false);
  const [reassignError, setReassignError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/login");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "admin") redirect("/dashboard");
  }, [session, status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptsRes, docsRes] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/doctors"),
        ]);
        setAppointments(await aptsRes.json());
        setDoctors(await docsRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchData();
  }, [session]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel");
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" } : a));
    } catch {
      alert("Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  const openReassign = (apt: any) => {
    setReassigningId(apt.id);
    setNewDoctorId(apt.doctorId);
    setReassignError("");
  };

  const handleReassign = async (id: string) => {
    setReassigning(true);
    setReassignError("");
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: newDoctorId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to reassign");
      }
      const updated = await res.json();
      setAppointments((prev) => prev.map((a) => a.id === id ? updated : a));
      setReassigningId(null);
    } catch (err) {
      setReassignError(err instanceof Error ? err.message : "Failed to reassign");
    } finally {
      setReassigning(false);
    }
  };

  if (status === "loading" || loading) return <PageLoader />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = appointments.filter((a) => {
    const aptDate = new Date(a.appointmentDate);
    if (filter === "today") {
      const d = new Date(aptDate); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }
    if (filter === "upcoming") return aptDate > new Date() && a.status !== "cancelled";
    if (filter === "past") return aptDate < new Date() && a.status !== "cancelled";
    if (filter === "cancelled") return a.status === "cancelled";
    return true;
  });

  const actionable = (apt: any) =>
    apt.status !== "cancelled" && apt.status !== "completed";

  return (
    <MainLayout topBarTitle="Appointments">
        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                border: "1px solid", cursor: "pointer", textTransform: "capitalize",
                background: filter === f ? "#2563EB" : "#fff",
                color: filter === f ? "#fff" : "#475569",
                borderColor: filter === f ? "#2563EB" : "#E2E8F0",
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {(["scheduled","completed","cancelled"] as const).map((s) => (
            <div key={s} className="stat-tile">
              <div>
                <div className="stat-value">{appointments.filter((a) => a.status === s).length}</div>
                <div className="stat-label" style={{ textTransform: "capitalize" }}>{s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((apt) => (
              <div key={apt.id}>
                <AppointmentCard
                  appointment={apt}
                  onCancel={actionable(apt) ? handleCancel : undefined}
                  onEdit={actionable(apt) ? () => reassigningId === apt.id ? setReassigningId(null) : openReassign(apt) : undefined}
                  editLabel={reassigningId === apt.id ? "Close" : "Reassign"}
                />
                {cancellingId === apt.id && (
                  <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Cancelling...</p>
                )}

                {reassigningId === apt.id && (
                  <div style={{ marginTop: 4, padding: 16, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#1D4ED8" }}>Reassign to a Different Doctor</p>
                    {reassignError && <p style={{ fontSize: 12, color: "#DC2626" }}>{reassignError}</p>}
                    <div>
                      <label className="form-label">Doctor</label>
                      <select value={newDoctorId} onChange={(e) => setNewDoctorId(e.target.value)} className="form-select">
                        {doctors.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}{d.specialty ? ` – ${d.specialty}` : ""}
                            {d.id === apt.doctorId ? " (current)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleReassign(apt.id)}
                        disabled={reassigning || newDoctorId === apt.doctorId}
                        className="btn-primary" style={{ fontSize: 12 }}>
                        {reassigning ? "Saving..." : "Confirm"}
                      </button>
                      <button onClick={() => setReassigningId(null)} className="btn-secondary" style={{ fontSize: 12 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#94A3B8", fontSize: 13 }}>No appointments found</p>
        )}
    </MainLayout>
  );
}
