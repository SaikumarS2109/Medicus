"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

export default function DoctorPatientsPage() {
  const { data: session, status } = useSession();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "doctor" && session?.user.role !== "admin") {
      redirect("/dashboard");
    }
  }, [session, status]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchPatients();
    }
  }, [session]);

  if (status === "loading" || loading) return <PageLoader />;

  return (
    <MainLayout topBarTitle="Patients">
        {patients.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {patients.map((patient) => (
              <div key={patient.id} className="card">
                <div style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0F172A" }}>{patient.user?.name || "Unknown"}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{patient.user?.email}</div>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                      <span style={{ color: "#94A3B8" }}>DOB: </span>{patient.dateOfBirth || "Not provided"}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                      <span style={{ color: "#94A3B8" }}>Blood Type: </span>{patient.bloodType || "Not provided"}
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <a href={`/doctor/patients/${patient.id}`} className="btn-primary" style={{ fontSize: 12 }}>View Full Record</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#94A3B8", fontSize: 13 }}>No patients yet</p>
        )}
    </MainLayout>
  );
}
