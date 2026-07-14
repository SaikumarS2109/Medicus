"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [roleError, setRoleError] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [specialty, setSpecialty] = useState("");

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
        const allUsersRes = await fetch("/api/auth/users");
        const allUsersData = await allUsersRes.json();
        setUsers(allUsersData);

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

  const handleUpdateRole = async (userId: string) => {
    if (!selectedRole) {
      setRoleError("Please select a role");
      return;
    }

    setRoleError("");
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole.toLowerCase(),
          specialty: selectedRole === "doctor" ? specialty : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update role");
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: selectedRole.toLowerCase() } : u));
      setUpdatingRole(null);
      setSelectedRole("");
      setSpecialty("");
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  if (status === "loading" || loading) return <PageLoader />;

  return (
    <MainLayout topBarTitle="Users">
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {(["all", "patients", "doctors"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                border: "1px solid", cursor: "pointer", textTransform: "capitalize",
                background: activeTab === tab ? "#2563EB" : "#fff",
                color: activeTab === tab ? "#fff" : "#475569",
                borderColor: activeTab === tab ? "#2563EB" : "#E2E8F0",
              }}>
              {tab === "all" ? `All Users (${users.length})` : tab === "patients" ? `Patients (${patients.length})` : `Doctors (${doctors.length})`}
            </button>
          ))}
        </div>

        {activeTab === "all" && (
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <tr>
                  {["Name", "Email", "Role", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #F8FAFC" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{user.name}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#475569" }}>{user.email}</td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#475569", textTransform: "capitalize" }}>{user.role}</td>
                    <td style={{ padding: "12px 20px" }}>
                      {user.role === "patient" && (
                        <button onClick={() => { setUpdatingRole(user.id); setSelectedRole(""); setSpecialty(""); }} className="btn-secondary" style={{ fontSize: 11, padding: "6px 10px" }}>
                          Promote
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No users found</div>}
          </div>
        )}

        {updatingRole && (
          <div style={{ marginTop: 16, padding: 20, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>Promote User</h3>
            {roleError && <p style={{ fontSize: 12, color: "#DC2626", marginBottom: 10 }}>{roleError}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="form-label">New Role *</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="form-select">
                  <option value="">Select role...</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {selectedRole === "doctor" && (
                <div>
                  <label className="form-label">Specialty</label>
                  <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g., Cardiology" className="form-input" />
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleUpdateRole(updatingRole)} className="btn-primary" style={{ fontSize: 12 }}>Confirm</button>
                <button onClick={() => setUpdatingRole(null)} className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

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
