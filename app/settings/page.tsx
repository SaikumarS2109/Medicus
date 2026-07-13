"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [pwData, setPwData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (status === "unauthenticated") redirect("/login");
  if (status === "loading") return <PageLoader />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (pwData.newPassword !== pwData.confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setMessage("success:Password updated successfully!");
      setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const isSuccess = message.startsWith("success:");

  return (
    <MainLayout topBarTitle="Settings">
      <div style={{ maxWidth: 480 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Change Password</span></div>
          <div className="card-body">
            <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>Signed in as {session?.user.name}</p>
            {message && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, fontSize: 13, border: "1px solid", ...(isSuccess ? { background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" } : { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }) }}>
                {isSuccess ? message.slice(8) : message}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
              <button type="submit" disabled={saving} className="btn-primary" style={{ alignSelf: "flex-start" }}>
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
