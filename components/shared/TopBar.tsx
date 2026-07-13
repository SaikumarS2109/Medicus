"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface TopBarProps {
  title?: string;
  actions?: ReactNode;
}

const PATH_TITLES: Record<string, string> = {
  "/dashboard":              "Dashboard",
  "/appointments":           "Appointments",
  "/appointments/book":      "Book Appointment",
  "/prescriptions":          "Prescriptions",
  "/profile":                "Profile",
  "/settings":               "Settings",
  "/doctor/patients":        "Patients",
  "/doctor/my-prescriptions":"Prescriptions",
  "/doctor/schedule":        "Schedule",
  "/admin/users":            "User Management",
  "/admin/appointments":     "Appointments",
  "/admin/schedule":         "Staff Schedule",
};

export default function TopBar({ title, actions }: TopBarProps) {
  const pathname = usePathname();

  const resolvedTitle =
    title ??
    PATH_TITLES[pathname] ??
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ??
    "Medicus";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="topbar">
      <div>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#0F172A",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {resolvedTitle}
        </h1>
        <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{today}</p>
      </div>
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
