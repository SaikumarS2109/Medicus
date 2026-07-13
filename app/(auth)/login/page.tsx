import LoginForm from "@/components/shared/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fff" }}>
      <div className="card" style={{ width: 384, padding: 32 }}>
        <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#0F172A", marginBottom: 20 }}>Log In</h1>
        <LoginForm />
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#475569" }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: "#2563EB", textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
