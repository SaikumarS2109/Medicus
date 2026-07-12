"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";

export default function BookAppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    if (session?.user.role !== "patient") {
      redirect("/dashboard");
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch patient info
        const patientRes = await fetch("/api/patients", { method: "GET" });
        const patientData = await patientRes.json();
        if (patientData.length > 0) {
          setPatient(patientData[0]);
        }

        // Fetch doctors
        const doctorsRes = await fetch("/api/doctors", { method: "GET" });
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const doctorId = formData.get("doctorId") as string;
      const appointmentDate = formData.get("appointmentDate") as string;
      const reason = formData.get("reason") as string;

      if (!patient) {
        setError("Patient information not found");
        return;
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId,
          appointmentDate: new Date(appointmentDate),
          reason,
          duration: 30,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }

      router.push("/appointments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!session?.user.role) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-gray-600 mb-8">
            Select a doctor and preferred date/time for your appointment
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="doctorId" className="block text-sm font-medium mb-2">
                Select Doctor *
              </label>
              <select
                id="doctorId"
                name="doctorId"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                    {doctor.specialty ? ` - ${doctor.specialty}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium mb-2">
                Preferred Date & Time *
              </label>
              <input
                type="datetime-local"
                id="appointmentDate"
                name="appointmentDate"
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2">
                Reason for Visit
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                placeholder="Describe your symptoms or reason for the appointment"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {submitting ? "Booking..." : "Book Appointment"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
