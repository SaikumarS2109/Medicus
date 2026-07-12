"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import PrescriptionCard from "@/components/shared/PrescriptionCard";

export default function DoctorPrescriptionsPage() {
  const { data: session, status } = useSession();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
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
    const fetchPrescriptions = async () => {
      try {
        const res = await fetch("/api/prescriptions");
        const data = await res.json();
        setPrescriptions(data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchPrescriptions();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <div className="p-8">Loading...</div>;
  }

  const activePrescriptions = prescriptions.filter((p) => p.status === "active");
  const inactivePrescriptions = prescriptions.filter((p) => p.status !== "active");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Manage Prescriptions</h1>

        {activePrescriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Active Prescriptions</h2>
            <div className="space-y-4">
              {activePrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          </div>
        )}

        {inactivePrescriptions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Inactive Prescriptions</h2>
            <div className="space-y-4">
              {inactivePrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          </div>
        )}

        {prescriptions.length === 0 && (
          <p className="text-gray-600 text-lg">No prescriptions yet</p>
        )}
      </div>
    </div>
  );
}
