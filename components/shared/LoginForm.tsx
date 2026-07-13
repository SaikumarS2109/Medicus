"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error(result?.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label className="form-label">Email *</label>
        <input
          type="email"
          name="email"
          required
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Password *</label>
        <input
          type="password"
          name="password"
          required
          className="form-input"
        />
      </div>

      {error && <p style={{ fontSize: 12, color: "#DC2626", padding: "8px 10px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6 }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
