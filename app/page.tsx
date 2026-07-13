"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/shared/PageLoader";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") return <PageLoader />;

  if (status === "authenticated") return <PageLoader />;

  return (
    <div style={{ background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "16px 32px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A" }}>Medicus</h1>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/login" style={{ fontSize: "13px", color: "#475569", textDecoration: "none" }}>
              Log In
            </Link>
            <Link href="/signup" className="btn-primary" style={{ fontSize: "13px" }}>
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "48px 32px" }}>
        <section style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "42px", fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>Welcome to Medicus</h2>
          <p style={{ fontSize: "16px", color: "#475569", marginBottom: 24, lineHeight: 1.6 }}>
            Manage appointments, prescriptions, and medical records in one secure place
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/login" className="btn-primary" style={{ fontSize: "14px", padding: "10px 24px" }}>
              Log In
            </Link>
            <Link href="/signup" className="btn-secondary" style={{ fontSize: "14px", padding: "10px 24px" }}>
              Create Account
            </Link>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 48 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: "32px", marginBottom: 12 }}>👤</div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>For Patients</h3>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
              Book appointments, view prescriptions, and manage your medical records securely.
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: "32px", marginBottom: 12 }}>👨‍⚕️</div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>For Doctors</h3>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
              View patient records, create prescriptions, and manage your schedule efficiently.
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: "32px", marginBottom: 12 }}>⚙️</div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0F172A", marginBottom: 8 }}>For Admins</h3>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
              Manage staff schedules, users, and oversee all appointments and operations.
            </p>
          </div>
        </section>

        <section className="card" style={{ padding: 40, textAlign: "center" }}>
          <h3 style={{ fontSize: "28px", fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>Ready to get started?</h3>
          <p style={{ fontSize: "14px", color: "#475569", marginBottom: 20, lineHeight: 1.6 }}>
            Join healthcare providers and patients using Medicus to streamline care coordination.
          </p>
          <Link href="/signup" className="btn-primary" style={{ fontSize: "14px", padding: "10px 24px", display: "inline-block" }}>
            Sign Up Now
          </Link>
        </section>
      </main>

      <footer style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0", padding: "24px 32px", marginTop: 48, textAlign: "center" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ fontSize: "12px", color: "#94A3B8" }}>&copy; 2026 Medicus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
