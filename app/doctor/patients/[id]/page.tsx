"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";
import PrescriptionCard from "@/components/shared/PrescriptionCard";
import PageLoader from "@/components/shared/PageLoader";
import MainLayout from "@/components/shared/MainLayout";

export default function PatientDetailsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit patient profile
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editData, setEditData] = useState({
    dateOfBirth: "", gender: "", bloodType: "", allergies: "",
    medicalHistory: "", insurance: "", emergencyContact: "",
  });

  // Prescription form
  const [addingRx, setAddingRx] = useState(false);
  const [creatingPrescription, setCreatingPrescription] = useState(false);
  const [rxData, setRxData] = useState({ medication: "", dosage: "", frequency: "", startDate: "" });

  // Appointment editing
  const [expandedAptId, setExpandedAptId] = useState<string | null>(null);
  const [aptSaving, setAptSaving] = useState(false);
  const [aptError, setAptError] = useState("");
  const [aptEdit, setAptEdit] = useState<Record<string, any>>({});

  useEffect(() => {
    if (status === "unauthenticated") redirect("/login");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "doctor" && session?.user.role !== "admin") {
      redirect("/dashboard");
    }
  }, [session, status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsRes = await fetch("/api/patients");
        const patientsData = await patientsRes.json();
        setPatient(patientsData.find((p: any) => p.id === patientId) ?? null);

        const [aptsRes, rxRes] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/prescriptions"),
        ]);
        const aptsData = await aptsRes.json();
        setAppointments(aptsData.filter((a: any) => a.patientId === patientId));

        const rxResData = await rxRes.json();
        setPrescriptions(rxResData.filter((p: any) => p.patientId === patientId));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchData();
  }, [session, patientId]);

  const startEditing = () => {
    setEditData({
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().slice(0, 10) : "",
      gender: patient.gender || "",
      bloodType: patient.bloodType || "",
      allergies: patient.allergies || "",
      medicalHistory: patient.medicalHistory || "",
      insurance: patient.insurance || "",
      emergencyContact: patient.emergencyContact || "",
    });
    setSaveError("");
    setEditing(true);
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editData, dateOfBirth: editData.dateOfBirth || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const updated = await res.json();
      setPatient({ ...patient, ...updated });
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const startEditingApt = (apt: any) => {
    setExpandedAptId(apt.id);
    setAptError("");
    setAptEdit({
      status: apt.status,
      notes: apt.notes || "",
      bloodPressure: apt.bloodPressure || "",
      heartRate: apt.heartRate ?? "",
      temperature: apt.temperature ?? "",
      weight: apt.weight ?? "",
      oxygenSaturation: apt.oxygenSaturation ?? "",
    });
  };

  const handleSaveApt = async (aptId: string) => {
    setAptSaving(true);
    setAptError("");
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: aptEdit.status,
          notes: aptEdit.notes,
          bloodPressure: aptEdit.bloodPressure || null,
          heartRate: aptEdit.heartRate !== "" ? Number(aptEdit.heartRate) : null,
          temperature: aptEdit.temperature !== "" ? Number(aptEdit.temperature) : null,
          weight: aptEdit.weight !== "" ? Number(aptEdit.weight) : null,
          oxygenSaturation: aptEdit.oxygenSaturation !== "" ? Number(aptEdit.oxygenSaturation) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      const updated = await res.json();
      setAppointments((prev) => prev.map((a) => a.id === aptId ? updated : a));
      setExpandedAptId(null);
    } catch (err) {
      setAptError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setAptSaving(false);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPrescription(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          medication: rxData.medication,
          dosage: rxData.dosage,
          frequency: rxData.frequency,
          startDate: new Date(rxData.startDate),
        }),
      });
      if (!res.ok) throw new Error("Failed to create prescription");
      const newRx = await res.json();
      setPrescriptions((prev) => [newRx, ...prev]);
      setRxData({ medication: "", dosage: "", frequency: "", startDate: "" });
      setAddingRx(false);
    } catch (error) {
      console.error("Error creating prescription:", error);
    } finally {
      setCreatingPrescription(false);
    }
  };

  if (status === "loading" || loading) return <PageLoader />;
  if (!patient) return <div style={{ padding: 32 }}>Patient not found</div>;

  return (
    <MainLayout topBarTitle={patient.user?.name || "Patient Record"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Patient profile card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Patient Information</span>
            {!editing && (
              <button onClick={startEditing} className="btn-secondary" style={{ fontSize: 12 }}>Edit</button>
            )}
          </div>
          {!editing ? (
            <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Email", patient.user?.email],
                ["DOB", patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "Not provided"],
                ["Gender", patient.gender || "Not provided"],
                ["Blood Type", patient.bloodType || "Not provided"],
                ["Allergies", patient.allergies || "None listed"],
                ["Medical History", patient.medicalHistory || "None listed"],
                ["Insurance", patient.insurance || "Not provided"],
                ["Emergency Contact", patient.emergencyContact || "Not provided"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#0F172A" }}>{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "14px 20px" }}>
              <form onSubmit={handleSavePatient} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {saveError && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>{saveError}</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input type="date" value={editData.dateOfBirth} onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} className="form-select">
                      <option value="">Not specified</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Blood Type</label>
                    <select value={editData.bloodType} onChange={(e) => setEditData({ ...editData, bloodType: e.target.value })} className="form-select">
                      <option value="">Unknown</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Insurance</label>
                    <input type="text" value={editData.insurance} onChange={(e) => setEditData({ ...editData, insurance: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Emergency Contact</label>
                    <input type="text" value={editData.emergencyContact} onChange={(e) => setEditData({ ...editData, emergencyContact: e.target.value })} className="form-input" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Allergies</label>
                  <textarea value={editData.allergies} rows={2} onChange={(e) => setEditData({ ...editData, allergies: e.target.value })} className="form-textarea" />
                </div>
                <div>
                  <label className="form-label">Medical History</label>
                  <textarea value={editData.medicalHistory} rows={3} onChange={(e) => setEditData({ ...editData, medicalHistory: e.target.value })} className="form-textarea" />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: 12 }}>{saving ? "Saving..." : "Save Changes"}</button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Two-column: appointments + prescriptions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Appointments */}
          <div className="card" style={{ display: "flex", flexDirection: "column", height: "28rem" }}>
            <div className="card-header" style={{ flexShrink: 0 }}><span className="card-title">Appointments</span></div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
              {appointments.length > 0 ? appointments.map((apt) => (
                <div key={apt.id}>
                  <AppointmentCard
                    appointment={apt}
                    onEdit={session?.user.role === "doctor" ? () => expandedAptId === apt.id ? setExpandedAptId(null) : startEditingApt(apt) : undefined}
                    editLabel={expandedAptId === apt.id ? "Close" : "Edit"}
                  />
                  {expandedAptId === apt.id && (
                    <div style={{ marginTop: 4, padding: 14, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, display: "flex", flexDirection: "column", gap: 10 }}>
                      {aptError && <p style={{ fontSize: 12, color: "#DC2626" }}>{aptError}</p>}
                      <div>
                        <label className="form-label">Status</label>
                        <select value={aptEdit.status} onChange={(e) => setAptEdit({ ...aptEdit, status: e.target.value })} className="form-select">
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No-show</option>
                        </select>
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vitals</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          ["Blood Pressure", "text", "e.g. 120/80", "bloodPressure"],
                          ["Heart Rate (bpm)", "number", "e.g. 72", "heartRate"],
                          ["Temperature (°F)", "number", "e.g. 98.6", "temperature"],
                          ["Weight (kg)", "number", "e.g. 70", "weight"],
                          ["O₂ Saturation (%)", "number", "e.g. 98", "oxygenSaturation"],
                        ].map(([label, type, placeholder, key]) => (
                          <div key={key}>
                            <label className="form-label">{label}</label>
                            <input type={type} placeholder={placeholder} value={aptEdit[key]}
                              onChange={(e) => setAptEdit({ ...aptEdit, [key]: e.target.value })}
                              className="form-input" step={type === "number" && key !== "heartRate" ? "0.1" : undefined} />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="form-label">Notes</label>
                        <textarea rows={2} value={aptEdit.notes} onChange={(e) => setAptEdit({ ...aptEdit, notes: e.target.value })} className="form-textarea" />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleSaveApt(apt.id)} disabled={aptSaving} className="btn-primary" style={{ fontSize: 12 }}>{aptSaving ? "Saving..." : "Save"}</button>
                        <button onClick={() => setExpandedAptId(null)} className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <p style={{ color: "#94A3B8", fontSize: 13 }}>No appointments</p>
              )}
            </div>
          </div>

          {/* Prescriptions */}
          <div className="card" style={{ display: "flex", flexDirection: "column", height: "28rem" }}>
            <div className="card-header" style={{ flexShrink: 0 }}>
              <span className="card-title">Prescriptions</span>
              {session?.user.role === "doctor" && !addingRx && (
                <button onClick={() => setAddingRx(true)} className="btn-primary" style={{ fontSize: 12 }}>+ Add</button>
              )}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
              {addingRx && (
                <form onSubmit={handleCreatePrescription} style={{ marginBottom: 12, padding: 14, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#1D4ED8" }}>New Prescription</p>
                  <div>
                    <label className="form-label">Medication *</label>
                    <input type="text" value={rxData.medication} required onChange={(e) => setRxData({ ...rxData, medication: e.target.value })} className="form-input" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label className="form-label">Dosage *</label>
                      <input type="text" value={rxData.dosage} required placeholder="e.g., 500mg" onChange={(e) => setRxData({ ...rxData, dosage: e.target.value })} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Frequency *</label>
                      <input type="text" value={rxData.frequency} required placeholder="e.g., 2x daily" onChange={(e) => setRxData({ ...rxData, frequency: e.target.value })} className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Start Date *</label>
                    <input type="date" value={rxData.startDate} required onChange={(e) => setRxData({ ...rxData, startDate: e.target.value })} className="form-input" />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" disabled={creatingPrescription} className="btn-primary" style={{ fontSize: 12 }}>{creatingPrescription ? "Saving..." : "Save"}</button>
                    <button type="button" onClick={() => { setAddingRx(false); setRxData({ medication: "", dosage: "", frequency: "", startDate: "" }); }} className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button>
                  </div>
                </form>
              )}
              {prescriptions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {prescriptions.map((rx) => <PrescriptionCard key={rx.id} prescription={rx} />)}
                </div>
              ) : (
                !addingRx && <p style={{ color: "#94A3B8", fontSize: 13 }}>No prescriptions</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
