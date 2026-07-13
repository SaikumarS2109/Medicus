"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import PageLoader from "@/components/shared/PageLoader";
import PrescriptionCard from "@/components/shared/PrescriptionCard";
import MainLayout from "@/components/shared/MainLayout";

export default function PatientPrescriptionsPage() {
  const { data: session, status } = useSession();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (status === "loading" || loading) return <PageLoader />;

  const activePrescriptions = prescriptions.filter((p) => p.status === "active");
  const inactivePrescriptions = prescriptions.filter((p) => p.status !== "active");

  return (
    <MainLayout topBarTitle="Prescriptions">
        {activePrescriptions.length > 0 && (
          <div className="mb-8">
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Active</h2>
            <div className="space-y-3">
              {activePrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          </div>
        )}

        {inactivePrescriptions.length > 0 && (
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Past</h2>
            <div className="space-y-3">
              {inactivePrescriptions.map((rx) => (
                <PrescriptionCard key={rx.id} prescription={rx} />
              ))}
            </div>
          </div>
        )}

        {prescriptions.length === 0 && (
          <p style={{ color: "#94A3B8", fontSize: 13 }}>No prescriptions found</p>
        )}
    </MainLayout>
  );
}
