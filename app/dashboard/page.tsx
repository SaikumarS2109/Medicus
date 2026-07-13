"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";
import PrescriptionCard from "@/components/shared/PrescriptionCard";
import MainLayout from "@/components/shared/MainLayout";
import PageLoader from "@/components/shared/PageLoader";

function StatTile({ icon, value, label, color }: { icon: React.ReactNode; value: number | string; label: string; color: "blue" | "green" | "amber" }) {
  return (
    <div className="stat-tile">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
        {badge && (
          <span style={{ fontSize: 11, color: "#94A3B8", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 99, padding: "2px 8px" }}>
            {badge}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ padding: "24px 20px", color: "#94A3B8", fontSize: 13 }}>{text}</div>
  );
}

export default function DashboardRouter() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/login");
    if (status === "authenticated") setLoading(true);
  }, [status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user.role === "patient") {
          const patientData = await fetch("/api/patients").then((r) => r.json());
          if (patientData.length > 0) {
            setPatient(patientData[0]);
            const [aptsData, rxData] = await Promise.all([
              fetch("/api/appointments").then((r) => r.json()),
              fetch("/api/prescriptions").then((r) => r.json()),
            ]);
            setAppointments(aptsData);
            setPrescriptions(rxData);
          }
        } else if (session?.user.role === "doctor") {
          const [aptsData, patientsData] = await Promise.all([
            fetch("/api/appointments").then((r) => r.json()),
            fetch("/api/patients").then((r) => r.json()),
          ]);
          setAppointments(aptsData);
          setPatients(patientsData);
        } else if (session?.user.role === "admin") {
          const [aptsData, shiftsData] = await Promise.all([
            fetch("/api/appointments").then((r) => r.json()),
            fetch("/api/shifts").then((r) => r.json()),
          ]);
          setAppointments(aptsData);
          setShifts(shiftsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchData();
  }, [session]);

  if (status === "loading" || loading) return <PageLoader />;
  if (!session?.user.role) redirect("/login");

  // ── Patient Dashboard ────────────────────────────────────────────────
  if (session.user.role === "patient") {
    const upcomingAppointments = appointments.filter(
      (a) => new Date(a.appointmentDate) > new Date() && a.status === "scheduled"
    );
    const activeRx = prescriptions.filter((p) => p.status === "active");

    return (
      <MainLayout
        topBarTitle="Dashboard"
        topBarActions={
          <a href="/appointments/book" className="btn-primary">
            Book Appointment
          </a>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <SectionCard title="Upcoming Appointments" badge={`${upcomingAppointments.length}`}>
            {upcomingAppointments.length > 0 ? (
              <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
                {upcomingAppointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            ) : (
              <Empty text="No upcoming appointments" />
            )}
          </SectionCard>

          <SectionCard title="Active Prescriptions" badge={`${activeRx.length}`}>
            {activeRx.length > 0 ? (
              <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
                {activeRx.map((rx) => (
                  <PrescriptionCard key={rx.id} prescription={rx} />
                ))}
              </div>
            ) : (
              <Empty text="No active prescriptions" />
            )}
          </SectionCard>
        </div>

        {patient && (
          <SectionCard title="Medical Record">
            <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Date of Birth", patient.dateOfBirth || "Not provided"],
                ["Blood Type", patient.bloodType || "Not provided"],
                ["Allergies", patient.allergies || "None listed"],
                ["Medical History", patient.medicalHistory || "None listed"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#0F172A" }}>{value}</div>
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
                <a href="/profile" className="btn-secondary" style={{ width: "fit-content" }}>Edit Profile</a>
              </div>
            </div>
          </SectionCard>
        )}
      </MainLayout>
    );
  }

  // ── Doctor Dashboard ─────────────────────────────────────────────────
  if (session.user.role === "doctor") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAppointments = appointments.filter((a) => {
      const d = new Date(a.appointmentDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    return (
      <MainLayout topBarTitle="Dashboard">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <SectionCard title="Today's Appointments" badge={`${todayAppointments.length}`}>
            {todayAppointments.length > 0 ? (
              <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
                {todayAppointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            ) : (
              <Empty text="No appointments today" />
            )}
          </SectionCard>

          <SectionCard title="Your Patients" badge={`${patients.length}`}>
            {patients.length > 0 ? (
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {patients.slice(0, 6).map((p) => (
                  <a
                    key={p.id}
                    href={`/doctor/patients/${p.id}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 20px", borderBottom: "1px solid #F8FAFC",
                      textDecoration: "none", color: "inherit",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{p.user?.name}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>{p.user?.email}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </a>
                ))}
              </div>
            ) : (
              <Empty text="No patients yet" />
            )}
          </SectionCard>
        </div>
      </MainLayout>
    );
  }

  // ── Admin Dashboard ──────────────────────────────────────────────────
  if (session.user.role === "admin") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAppointments = appointments.filter((a) => {
      const d = new Date(a.appointmentDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    const staffOnDuty = new Set(
      shifts.filter((s) => {
        const d = new Date(s.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      }).map((s) => s.doctorId)
    );

    return (
      <MainLayout topBarTitle="Dashboard">
        {/* Stat tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <StatTile
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                <polyline points="9 16 11 18 15 14"/>
              </svg>
            }
            value={todayAppointments.length}
            label="Today's Appointments"
            color="blue"
          />
          <StatTile
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <polyline points="16 11 18 13 22 9"/>
              </svg>
            }
            value={staffOnDuty.size}
            label="Staff on Duty"
            color="green"
          />
          <StatTile
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            }
            value={appointments.length}
            label="Total Appointments"
            color="amber"
          />
        </div>

        {/* Cards row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Quick actions */}
          <SectionCard title="Quick Actions">
            {[
              { href: "/admin/schedule", label: "Manage Staff Schedule", sub: "View and edit doctor shifts" },
              { href: "/admin/users",    label: "Manage Users",          sub: "Patients and doctors" },
              { href: "/admin/appointments", label: "All Appointments",  sub: "View, cancel, or reassign" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 20px", borderBottom: "1px solid #F8FAFC",
                  textDecoration: "none", color: "inherit", transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{item.sub}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            ))}
          </SectionCard>

          {/* Today's appointments */}
          <SectionCard title="Today's Appointments" badge={`${todayAppointments.length}`}>
            {todayAppointments.length > 0 ? (
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {todayAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} style={{ padding: "10px 20px", borderBottom: "1px solid #F8FAFC" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>
                      {apt.patient?.user?.name} → Dr. {apt.doctor?.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                      {new Date(apt.appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No appointments today" />
            )}
          </SectionCard>
        </div>
      </MainLayout>
    );
  }

  return <div style={{ padding: 32 }}>Unauthorized</div>;
}
