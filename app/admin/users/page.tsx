"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("patients");

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
    const fetchUsers = async () => {
      try {
        const patientsRes = await fetch("/api/patients");
        const patientsData = await patientsRes.json();
        setPatients(patientsData);

        const doctorsRes = await fetch("/api/doctors");
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUsers();
    }
  }, [session]);

  if (status === "loading" || loading) return <PageLoader />;

  return (
    <MainLayout topBarTitle="Users">
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {(["patients", "doctors"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                border: "1px solid", cursor: "pointer", textTransform: "capitalize",
                background: activeTab === tab ? "#2563EB" : "#fff",
                color: activeTab === tab ? "#fff" : "#475569",
                borderColor: activeTab === tab ? "#2563EB" : "#E2E8F0",
              }}>
              {tab === "patients" ? `Patients (${patients.length})` : `Doctors (${doctors.length})`}
            </button>
          ))}
        </div>

        {activeTab === "patients" && (
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <tr>
                  {["Name","Email","Blood Type","Allergies",""].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} style={{ borderBottom: "1px solid #F8FAFC" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{patient.user?.name}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#475569" }}>{patient.user?.email}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#475569" }}>{patient.bloodType || "—"}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#475569" }}>{patient.allergies || "None"}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <a href={`/doctor/patients/${patient.id}`} className="btn-text" style={{ fontSize: 12 }}>View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {patients.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No patients found</div>}
          </div>
        )}

        {activeTab === "doctors" && (
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <tr>
                  {["Name","Email","Specialty",""].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} style={{ borderBottom: "1px solid #F8FAFC" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{doctor.name}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#475569" }}>{doctor.email}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#475569" }}>{doctor.specialty || "—"}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <a href={`/admin/doctors/${doctor.id}`} className="btn-text" style={{ fontSize: 12 }}>View Profile</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {doctors.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No doctors found</div>}
          </div>
        )}
    </MainLayout>
  );
}
