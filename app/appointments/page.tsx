"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
});

function isMoreThan24HoursAway(dateStr: string) {
  return new Date(dateStr).getTime() - Date.now() > 24 * 60 * 60 * 1000;
}

export default function PatientAppointmentsPage() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [availability, setAvailability] = useState<{ date: string; startTime: string; endTime: string }[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Cancel state
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/login");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "patient") redirect("/dashboard");
  }, [session, status]);

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
    if (session) fetchAppointments();
  }, [session]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to cancel appointment");
        return;
      }
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" } : a));
    } catch {
      alert("Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  const openReschedule = async (apt: any) => {
    setReschedulingId(apt.id);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleError("");
    setAvailability([]);
    setLoadingAvailability(true);
    try {
      const res = await fetch(`/api/doctors/${apt.doctorId}/availability`);
      const data = await res.json();
      setAvailability(data);
    } catch {
      setAvailability([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleReschedule = async (id: string) => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError("Please select a date and time.");
      return;
    }
    setRescheduling(true);
    setRescheduleError("");
    try {
      const appointmentDate = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentDate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to reschedule");
      }
      const updated = await res.json();
      setAppointments((prev) => prev.map((a) => a.id === id ? updated : a));
      setReschedulingId(null);
    } catch (err) {
      setRescheduleError(err instanceof Error ? err.message : "Failed to reschedule");
    } finally {
      setRescheduling(false);
    }
  };

  if (status === "loading" || loading) return <PageLoader />;

  const todayStr = new Date().toISOString().slice(0, 10);

  const availableDates = Array.from(
    availability.reduce((map, a) => {
      const existing = map.get(a.date);
      if (!existing) {
        map.set(a.date, { date: a.date, startTime: a.startTime, endTime: a.endTime });
      } else {
        map.set(a.date, {
          date: a.date,
          startTime: a.startTime < existing.startTime ? a.startTime : existing.startTime,
          endTime: a.endTime > existing.endTime ? a.endTime : existing.endTime,
        });
      }
      return map;
    }, new Map<string, { date: string; startTime: string; endTime: string }>()).values()
  );

  const shiftForDate = availableDates.find((a) => a.date === rescheduleDate);

  const availableSlots = (() => {
    if (!shiftForDate) return [];
    const { startTime, endTime } = shiftForDate;
    const now = new Date();
    return TIME_SLOTS.filter((slot) => {
      if (slot < startTime || slot >= endTime) return false;
      if (rescheduleDate === todayStr) {
        const [h, m] = slot.split(":").map(Number);
        const d = new Date(); d.setHours(h, m, 0, 0);
        return d > now;
      }
      return true;
    });
  })();

  const upcoming = appointments.filter((a) => a.status === "scheduled" && new Date(a.appointmentDate) > new Date());
  const past = appointments.filter((a) => a.status !== "scheduled" || new Date(a.appointmentDate) <= new Date());

  return (
    <MainLayout
      topBarTitle="Appointments"
      topBarActions={<a href="/appointments/book" className="btn-primary">Book New</a>}
    >
        {/* Upcoming */}
        <section className="mb-10">
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Upcoming</h2>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((apt) => {
                const canAct = isMoreThan24HoursAway(apt.appointmentDate);
                return (
                  <div key={apt.id}>
                    <AppointmentCard
                      appointment={apt}
                      onCancel={canAct ? handleCancel : undefined}
                      onEdit={canAct ? () => reschedulingId === apt.id ? setReschedulingId(null) : openReschedule(apt) : undefined}
                      editLabel={reschedulingId === apt.id ? "Close" : "Reschedule"}
                    />
                    {cancellingId === apt.id && (
                      <p className="text-xs text-gray-500 mt-1 pl-1">Cancelling...</p>
                    )}

                    {reschedulingId === apt.id && (
                      <div className="mt-3 p-4 border border-slate-200 rounded-lg" style={{ background: "#F8FAFC" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>Reschedule Appointment</p>
                        {rescheduleError && <p style={{ fontSize: 12, color: "#DC2626", marginBottom: 10 }}>{rescheduleError}</p>}
                        {loadingAvailability ? (
                          <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>Loading availability...</p>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                            <div>
                              <label className="form-label">Available Date</label>
                              <select value={rescheduleDate}
                                onChange={(e) => { setRescheduleDate(e.target.value); setRescheduleTime(""); }}
                                disabled={availableDates.length === 0}
                                className="form-select"
                                style={availableDates.length === 0 ? { opacity: 0.5 } : {}}>
                                <option value="">{availableDates.length === 0 ? "No availability" : "Choose date..."}</option>
                                {availableDates.map(({ date, startTime, endTime }) => (
                                  <option key={date} value={date}>
                                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                    {" "}({startTime}–{endTime})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="form-label">Time Slot</label>
                              <select value={rescheduleTime}
                                onChange={(e) => setRescheduleTime(e.target.value)}
                                disabled={!rescheduleDate || availableSlots.length === 0}
                                className="form-select"
                                style={(!rescheduleDate || availableSlots.length === 0) ? { opacity: 0.5 } : {}}>
                                <option value="">
                                  {!rescheduleDate ? "Select date first" : availableSlots.length === 0 ? "No slots" : "Choose slot..."}
                                </option>
                                {availableSlots.map((slot) => {
                                  const [h, m] = slot.split(":").map(Number);
                                  const endMin = h * 60 + m + 30;
                                  const end = `${Math.floor(endMin / 60).toString().padStart(2, "0")}:${(endMin % 60).toString().padStart(2, "0")}`;
                                  return <option key={slot} value={slot}>{slot} – {end}</option>;
                                })}
                              </select>
                            </div>
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleReschedule(apt.id)} disabled={rescheduling || loadingAvailability}
                            className="btn-primary" style={{ fontSize: 12, flex: 1 }}>
                            {rescheduling ? "Saving..." : "Confirm"}
                          </button>
                          <button onClick={() => setReschedulingId(null)}
                            className="btn-secondary" style={{ fontSize: 12, flex: 1 }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#94A3B8", fontSize: 13 }}>No upcoming appointments. <a href="/appointments/book" style={{ color: "#2563EB" }}>Book one?</a></p>
          )}
        </section>

        {/* Past / cancelled */}
        {past.length > 0 && (
          <section>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Past & Cancelled</h2>
            <div className="space-y-3">
              {past.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          </section>
        )}
    </MainLayout>
  );
}
