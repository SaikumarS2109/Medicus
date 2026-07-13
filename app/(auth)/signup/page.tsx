import SignupForm from "@/components/shared/SignupForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fff" }}>
      <div className="card" style={{ width: 384, padding: 32 }}>
        <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#0F172A", marginBottom: 20 }}>Sign Up</h1>
        <SignupForm />
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#475569" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#2563EB", textDecoration: "none" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
