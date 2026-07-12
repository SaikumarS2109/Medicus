"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import ProfileCard from "@/components/shared/ProfileCard";

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
    if (session?.user.role !== "doctor") {
      redirect("/dashboard");
    }
  }, [session]);

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

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Patients</h1>

        {patients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-lg shadow-md p-6">
                <ProfileCard
                  name={patient.user?.name || "Unknown"}
                  email={patient.user?.email}
                />
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>DOB:</strong> {patient.dateOfBirth || "Not provided"}
                  </p>
                  <p>
                    <strong>Blood Type:</strong> {patient.bloodType || "Not provided"}
                  </p>
                </div>
                <a
                  href={`/doctor/patients/${patient.id}`}
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Full Record
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-lg">No patients yet</p>
        )}
      </div>
    </div>
  );
}
