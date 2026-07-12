"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { redirect } from "next/navigation";
import AppointmentCard from "@/components/shared/AppointmentCard";
import PrescriptionCard from "@/components/shared/PrescriptionCard";

export default function PatientDetailsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPrescription, setCreatingPrescription] = useState(false);
  const [rxData, setRxData] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    startDate: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (session?.user.role !== "doctor") {
      redirect("/dashboard");
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsRes = await fetch("/api/patients");
        const patientsData = await patientsRes.json();
        const found = patientsData.find((p: any) => p.id === patientId);
        setPatient(found);

        const appointmentsRes = await fetch("/api/appointments");
        const appointmentsData = await appointmentsRes.json();
        const filtered = appointmentsData.filter(
          (a: any) => a.patientId === patientId
        );
        setAppointments(filtered);

        const prescriptionsRes = await fetch("/api/prescriptions");
        const prescriptionsData = await prescriptionsRes.json();
        const rxFiltered = prescriptionsData.filter(
          (p: any) => p.patientId === patientId
        );
        setPrescriptions(rxFiltered);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, patientId]);

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

      if (!res.ok) {
        throw new Error("Failed to create prescription");
      }

      const newRx = await res.json();
      setPrescriptions([...prescriptions, newRx]);
      setRxData({
        medication: "",
        dosage: "",
        frequency: "",
        startDate: "",
      });
    } catch (error) {
      console.error("Error creating prescription:", error);
    } finally {
      setCreatingPrescription(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!patient) {
    return <div className="p-8">Patient not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4">{patient.user?.name}</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Email:</strong> {patient.user?.email}
            </div>
            <div>
              <strong>Blood Type:</strong> {patient.bloodType || "Not provided"}
            </div>
            <div>
              <strong>Allergies:</strong> {patient.allergies || "None listed"}
            </div>
            <div>
              <strong>Medical History:</strong>{" "}
              {patient.medicalHistory || "None listed"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Appointments</h2>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No appointments</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Prescriptions</h2>
            {prescriptions.length > 0 ? (
              <div className="space-y-4">
                {prescriptions.map((rx) => (
                  <PrescriptionCard key={rx.id} prescription={rx} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No prescriptions</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Create Prescription</h2>
          <form onSubmit={handleCreatePrescription} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Medication *
              </label>
              <input
                type="text"
                value={rxData.medication}
                onChange={(e) =>
                  setRxData({ ...rxData, medication: e.target.value })
                }
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={rxData.dosage}
                  onChange={(e) =>
                    setRxData({ ...rxData, dosage: e.target.value })
                  }
                  required
                  placeholder="e.g., 500mg"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequency *
                </label>
                <input
                  type="text"
                  value={rxData.frequency}
                  onChange={(e) =>
                    setRxData({ ...rxData, frequency: e.target.value })
                  }
                  required
                  placeholder="e.g., 2x daily"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={rxData.startDate}
                onChange={(e) =>
                  setRxData({ ...rxData, startDate: e.target.value })
                }
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={creatingPrescription}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creatingPrescription ? "Creating..." : "Create Prescription"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
