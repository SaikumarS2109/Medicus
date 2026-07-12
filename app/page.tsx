"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === "authenticated") {
    return <div className="flex items-center justify-center min-h-screen">Redirecting to dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-gray-900 text-white p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Healthcare Portal</h1>
          <div className="space-x-4">
            <Link href="/login" className="hover:text-gray-300">
              Log In
            </Link>
            <Link href="/signup" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Welcome to Healthcare Portal</h2>
          <p className="text-xl text-gray-600 mb-8">
            Manage appointments, prescriptions, and patient records in one place
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Create Account
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-2xl font-bold mb-2">For Patients</h3>
            <p className="text-gray-600">
              Book appointments, view prescriptions, and manage your medical records securely.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h3 className="text-2xl font-bold mb-2">For Doctors</h3>
            <p className="text-gray-600">
              View patient records, create prescriptions, and manage your schedule efficiently.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-2xl font-bold mb-2">For Admins</h3>
            <p className="text-gray-600">
              Manage staff schedules, users, and oversee all appointments and operations.
            </p>
          </div>
        </section>

        <section className="bg-blue-50 p-12 rounded-lg text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of healthcare providers and patients using our platform.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
          >
            Sign Up Now
          </Link>
        </section>
      </main>

      <footer className="bg-gray-900 text-white p-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2026 Healthcare Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
