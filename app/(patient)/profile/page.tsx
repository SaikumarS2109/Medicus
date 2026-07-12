"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import UploadProfilePicture from "@/components/shared/UploadProfilePicture";

export default function PatientProfilePage() {
  const { data: session, status } = useSession();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

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

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!patient) {
    return <div className="p-8">Patient not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Profile</h1>

        {message && (
          <div className={`mb-6 p-4 rounded ${message.includes("success") ? "bg-green-100 text-green-700 border border-green-400" : "bg-red-100 text-red-700 border border-red-400"}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Profile Picture</h2>
          {patient.profilePictureUrl && (
            <div className="mb-6">
              <img
                src={patient.profilePictureUrl}
                alt="Profile"
                className="w-32 h-32 rounded-lg object-cover"
              />
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

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Medical Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  defaultValue={
                    patient.dateOfBirth
                      ? new Date(patient.dateOfBirth)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  name="gender"
                  defaultValue={patient.gender || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Blood Type
                </label>
                <input
                  type="text"
                  name="bloodType"
                  defaultValue={patient.bloodType || ""}
                  placeholder="e.g., O+, A-, B++"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Insurance
                </label>
                <input
                  type="text"
                  name="insurance"
                  defaultValue={patient.insurance || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Allergies</label>
              <textarea
                name="allergies"
                defaultValue={patient.allergies || ""}
                rows={3}
                placeholder="List any allergies"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Medical History
              </label>
              <textarea
                name="medicalHistory"
                defaultValue={patient.medicalHistory || ""}
                rows={3}
                placeholder="List any past medical conditions"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                defaultValue={patient.emergencyContact || ""}
                placeholder="Name and phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
