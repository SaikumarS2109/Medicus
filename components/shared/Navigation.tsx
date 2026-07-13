"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  if (!session) {
    return null;
  }

  const patientLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/appointments", label: "Appointments" },
    { href: "/appointments/book", label: "Book Appointment" },
    { href: "/prescriptions", label: "Prescriptions" },
    { href: "/profile", label: "Profile" },
  ];

  const doctorLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/doctor/patients", label: "Patients" },
    { href: "/doctor/my-prescriptions", label: "Prescriptions" },
    { href: "/doctor/schedule", label: "Schedule" },
    { href: "/settings", label: "Settings" },
  ];

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/appointments", label: "Appointments" },
    { href: "/admin/schedule", label: "Schedule" },
    { href: "/settings", label: "Settings" },
  ];

  let navLinks: { href: string; label: string }[] = [];
  if (session.user.role === "patient") {
    navLinks = patientLinks;
  } else if (session.user.role === "doctor") {
    navLinks = doctorLinks;
  } else if (session.user.role === "admin") {
    navLinks = adminLinks;
  }

  return (
    <nav className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1">
            <Link href="/dashboard" className="font-bold text-xl">
              Medicus
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User info and sign out */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm">
              {session.user.name} ({session.user.role})
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white font-medium transition"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
          >
            <svg
              className={`h-6 w-6 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium transition"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-blue-500 mt-4 pt-4 space-y-2">
              <div className="text-sm px-3 py-2">
                {session.user.name} ({session.user.role})
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white font-medium transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
