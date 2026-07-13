"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

const ALL_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
});

function slotLabel(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  const endMin = h * 60 + m + 30;
  const end = `${Math.floor(endMin / 60).toString().padStart(2, "0")}:${(endMin % 60).toString().padStart(2, "0")}`;
  return `${slot} – ${end}`;
}

export default function BookAppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [patient, setPatient] = useState<any>(null);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // availability[date] = { startTime, endTime }
  const [availability, setAvailability] = useState<{ date: string; startTime: string; endTime: string }[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/login");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "patient") redirect("/dashboard");
  }, [session, status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientRes, doctorsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/doctors"),
        ]);
        const patientData = await patientRes.json();
        if (patientData.length > 0) setPatient(patientData[0]);
        setDoctors(await doctorsRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchData();
  }, [session]);

  // Fetch availability when doctor changes
  useEffect(() => {
    if (!selectedDoctor) { setAvailability([]); return; }
    const fetch_ = async () => {
      setLoadingAvailability(true);
      setSelectedDate("");
      setSelectedTime("");
      try {
        const res = await fetch(`/api/doctors/${selectedDoctor}/availability`);
        const data = await res.json();
        setAvailability(data);
      } catch {
        setAvailability([]);
      } finally {
        setLoadingAvailability(false);
      }
    };
    fetch_();
  }, [selectedDoctor]);

  // Deduplicate dates; merge shift hours (earliest start, latest end) per day
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

  // Merged shift window for selected date
  const shiftForDate = availableDates.find((a) => a.date === selectedDate);

  // Time slots: within shift hours, and in the future if today
  const availableSlots = (() => {
    if (!shiftForDate) return [];
    const { startTime, endTime } = shiftForDate;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return ALL_SLOTS.filter((slot) => {
      if (slot < startTime || slot >= endTime) return false;
      if (selectedDate === todayStr) {
        const [h, m] = slot.split(":").map(Number);
        const d = new Date(); d.setHours(h, m, 0, 0);
        return d > now;
      }
      return true;
    });
  })();

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const reason = formData.get("reason") as string;

      if (!patient) { setError("Patient information not found"); return; }
      if (!selectedDate || !selectedTime) { setError("Please select a date and time slot"); return; }

      const appointmentDate = new Date(`${selectedDate}T${selectedTime}:00`);
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: selectedDoctor,
          appointmentDate,
          reason,
          duration: 30,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to book appointment");
      }
      router.push("/appointments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) return <PageLoader />;
  if (!session?.user.role) redirect("/login");

  return (
    <MainLayout topBarTitle="Book Appointment">
      <div style={{ maxWidth: 560 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">New Appointment</span></div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 16 }}>
              Select a doctor — only dates they are available will be shown.
            </p>

            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, fontSize: 13, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label htmlFor="doctorId" className="form-label">Select Doctor *</label>
                <select id="doctorId" name="doctorId" required value={selectedDoctor} onChange={(e) => handleDoctorChange(e.target.value)} className="form-select">
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}{doctor.specialty ? ` – ${doctor.specialty}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="selectedDate" className="form-label">Available Date *</label>
                {loadingAvailability ? (
                  <p style={{ fontSize: 12, color: "#94A3B8" }}>Loading availability...</p>
                ) : (
                  <select id="selectedDate" required value={selectedDate} onChange={(e) => handleDateChange(e.target.value)}
                    disabled={!selectedDoctor || availableDates.length === 0} className="form-select" style={(!selectedDoctor || availableDates.length === 0) ? { opacity: 0.5 } : {}}>
                    <option value="">
                      {!selectedDoctor ? "Select a doctor first" : availableDates.length === 0 ? "No availability found" : "Choose a date..."}
                    </option>
                    {availableDates.map(({ date, startTime, endTime }) => (
                      <option key={date} value={date}>
                        {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        {" "}({startTime}–{endTime})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="selectedTime" className="form-label">Time Slot *</label>
                <select id="selectedTime" required value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate || availableSlots.length === 0} className="form-select" style={(!selectedDate || availableSlots.length === 0) ? { opacity: 0.5 } : {}}>
                  <option value="">
                    {!selectedDate ? "Select a date first" : availableSlots.length === 0 ? "No slots available for this date" : "Choose a time slot..."}
                  </option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>{slotLabel(slot)}</option>
                  ))}
                </select>
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>All appointments are 30 minutes</p>
              </div>

              <div>
                <label htmlFor="reason" className="form-label">Reason for Visit</label>
                <textarea id="reason" name="reason" rows={4}
                  placeholder="Describe your symptoms or reason for the appointment"
                  className="form-textarea" />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>
                  {submitting ? "Booking..." : "Book Appointment"}
                </button>
                <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
