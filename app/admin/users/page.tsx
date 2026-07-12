"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

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
    if (session?.user.role !== "admin") {
      redirect("/dashboard");
    }
  }, [session]);

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

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">User Management</h1>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("patients")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "patients"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 border border-gray-300"
            }`}
          >
            Patients ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab("doctors")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "doctors"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 border border-gray-300"
            }`}
          >
            Doctors ({doctors.length})
          </button>
        </div>

        {activeTab === "patients" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Blood Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Allergies
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{patient.user?.name}</td>
                    <td className="px-6 py-4">{patient.user?.email}</td>
                    <td className="px-6 py-4">
                      {patient.bloodType || "Not provided"}
                    </td>
                    <td className="px-6 py-4">
                      {patient.allergies || "None"}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/patients/${patient.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {patients.length === 0 && (
              <div className="p-8 text-center text-gray-600">
                No patients found
              </div>
            )}
          </div>
        )}

        {activeTab === "doctors" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Specialty
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{doctor.name}</td>
                    <td className="px-6 py-4">{doctor.email}</td>
                    <td className="px-6 py-4">
                      {doctor.specialty || "Not specified"}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/patients`}
                        className="text-blue-600 hover:underline"
                      >
                        View Patients
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {doctors.length === 0 && (
              <div className="p-8 text-center text-gray-600">
                No doctors found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
