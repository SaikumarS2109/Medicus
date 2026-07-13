"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavLink = { href: string; label: string; icon: React.ReactNode };

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconCalendarPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="12" y1="15" x2="12" y2="19"/><line x1="10" y1="17" x2="14" y2="17"/>
    </svg>
  );
}
function IconPill() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2"/>
      <circle cx="17" cy="17" r="5"/><path d="m15 19 4-4"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function IconMedicus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) return null;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  const patientLinks: NavLink[] = [
    { href: "/dashboard",          label: "Dashboard",        icon: <IconGrid /> },
    { href: "/appointments",       label: "Appointments",     icon: <IconCalendar /> },
    { href: "/appointments/book",  label: "Book Appointment", icon: <IconCalendarPlus /> },
    { href: "/prescriptions",      label: "Prescriptions",    icon: <IconPill /> },
    { href: "/profile",            label: "Profile",          icon: <IconUser /> },
  ];

  const doctorLinks: NavLink[] = [
    { href: "/dashboard",                label: "Dashboard",    icon: <IconGrid /> },
    { href: "/doctor/patients",          label: "Patients",     icon: <IconUsers /> },
    { href: "/doctor/my-prescriptions",  label: "Prescriptions",icon: <IconPill /> },
    { href: "/doctor/schedule",          label: "Schedule",     icon: <IconClock /> },
    { href: "/settings",                 label: "Settings",     icon: <IconSettings /> },
  ];

  const adminLinks: NavLink[] = [
    { href: "/dashboard",         label: "Dashboard",    icon: <IconGrid /> },
    { href: "/admin/users",       label: "Users",        icon: <IconUsers /> },
    { href: "/admin/appointments",label: "Appointments", icon: <IconCalendar /> },
    { href: "/admin/schedule",    label: "Schedule",     icon: <IconClock /> },
    { href: "/settings",          label: "Settings",     icon: <IconSettings /> },
  ];

  const navLinks =
    session.user.role === "patient" ? patientLinks
    : session.user.role === "doctor" ? doctorLinks
    : session.user.role === "admin"  ? adminLinks
    : [];

  const initials = session.user.name?.charAt(0).toUpperCase() ?? "?";

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile top bar (hamburger) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition"
          aria-label="Toggle navigation"
        >
          {isOpen ? <IconX /> : <IconMenu />}
        </button>
        <span className="ml-3 font-semibold text-sm text-slate-950">Medicus</span>
      </div>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          transform: isOpen ? "translateX(0)" : undefined,
        }}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div
            style={{
              width: 32, height: 32,
              background: "#2563EB",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <IconMedicus />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Medicus</div>
            <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {session.user.role}
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="sidebar-section flex-1">
          <div className="sidebar-section-label">Menu</div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeSidebar}
              className={`nav-item${isActive(link.href) ? " active" : ""}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 8 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#EFF6FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600, color: "#2563EB",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.name}
              </div>
              <div style={{ fontSize: 10.5, color: "#94A3B8", textTransform: "capitalize" }}>
                {session.user.role}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign out"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#94A3B8", padding: 4, borderRadius: 6, display: "flex",
                transition: "color 0.12s, background 0.12s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#DC2626"; (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; (e.currentTarget as HTMLElement).style.background = "none"; }}
            >
              <IconLogOut />
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop spacer so content doesn't sit under the fixed sidebar */}
      <div className="hidden md:block" style={{ width: 240, flexShrink: 0 }} />
    </>
  );
}
