"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import UploadProfilePicture from "@/components/shared/UploadProfilePicture";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

export default function PatientProfilePage() {
  const { data: session, status } = useSession();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [pwData, setPwData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "patient") {
      redirect("/dashboard");
    }
  }, [session, status]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        if (data.length > 0) {
          setPatient(data[0]);
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchPatient();
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");

    try {
      const formData = new FormData(e.currentTarget);
      const updateData = {
        dateOfBirth: formData.get("dateOfBirth") || undefined,
        gender: formData.get("gender") || undefined,
        bloodType: formData.get("bloodType") || undefined,
        allergies: formData.get("allergies") || undefined,
        medicalHistory: formData.get("medicalHistory") || undefined,
        insurance: formData.get("insurance") || undefined,
        emergencyContact: formData.get("emergencyContact") || undefined,
      };

      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const updated = await res.json();
      setPatient(updated);
      setMessage("Profile updated successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage("");
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMessage("New passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setPwMessage("success:Password updated successfully!");
      setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwMessage(""), 3000);
    } catch (err) {
      setPwMessage(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  if (status === "loading" || loading) return <PageLoader />;

  if (!patient) {
    return <div className="p-8">Patient not found</div>;
  }

  return (
    <MainLayout topBarTitle="Profile">
      <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
        {message && (
          <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, border: "1px solid", ...(message.includes("success") ? { background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" } : { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }) }}>
            {message}
          </div>
        )}

        <div className="card">
          <div className="card-header"><span className="card-title">Profile Picture</span></div>
          <div className="card-body">
            {patient.profilePictureUrl && (
              <div style={{ marginBottom: 16 }}>
                <img src={patient.profilePictureUrl} alt="Profile" style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover" }} />
              </div>
            )}
            <UploadProfilePicture
              onSuccess={(url) => {
                setPatient({ ...patient, profilePictureUrl: url });
                setMessage("Profile picture uploaded successfully!");
                setTimeout(() => setMessage(""), 3000);
              }}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Medical Information</span></div>
          <div className="card-body">
            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label">Date of Birth</label>
                  <input type="date" name="dateOfBirth" className="form-input"
                    defaultValue={patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : ""} />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select name="gender" defaultValue={patient.gender || ""} className="form-select">
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Blood Type</label>
                  <input type="text" name="bloodType" defaultValue={patient.bloodType || ""} placeholder="e.g., O+, A-" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Insurance</label>
                  <input type="text" name="insurance" defaultValue={patient.insurance || ""} className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Allergies</label>
                <textarea name="allergies" defaultValue={patient.allergies || ""} rows={3} placeholder="List any allergies" className="form-textarea" />
              </div>
              <div>
                <label className="form-label">Medical History</label>
                <textarea name="medicalHistory" defaultValue={patient.medicalHistory || ""} rows={3} placeholder="List any past medical conditions" className="form-textarea" />
              </div>
              <div>
                <label className="form-label">Emergency Contact</label>
                <input type="text" name="emergencyContact" defaultValue={patient.emergencyContact || ""} placeholder="Name and phone number" className="form-input" />
              </div>
              <button type="submit" disabled={updating} className="btn-primary" style={{ alignSelf: "flex-start" }}>
                {updating ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Change Password</span></div>
          <div className="card-body" style={{ padding: 20 }}>
            {pwMessage && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, fontSize: 13, border: "1px solid", ...(pwMessage.startsWith("success:") ? { background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" } : { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }) }}>
                {pwMessage.startsWith("success:") ? pwMessage.slice(8) : pwMessage}
              </div>
            )}
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="form-label">Current Password</label>
                <input type="password" required value={pwData.currentPassword}
                  onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                  className="form-input" />
              </div>
              <div>
                <label className="form-label">New Password</label>
                <input type="password" required minLength={8} value={pwData.newPassword}
                  onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="form-input" />
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input type="password" required value={pwData.confirmPassword}
                  onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
                  className="form-input" />
              </div>
              <button type="submit" disabled={pwSaving} className="btn-primary" style={{ alignSelf: "flex-start" }}>
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
