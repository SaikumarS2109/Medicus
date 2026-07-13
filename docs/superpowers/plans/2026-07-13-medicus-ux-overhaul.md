# Medicus UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Medicus from generic default-Tailwind to a modern, intentional healthcare portal with sidebar navigation, refined color palette, lightweight typography, and role-specific dashboards.

**Architecture:** 
- Build component layer first (Sidebar, TopBar, Button, Card, Badge) with tight spec adherence
- Create MainLayout wrapper combining Sidebar + TopBar + content
- Apply to all authenticated pages
- Update existing cards/badges to match new design
- Test responsive behavior and accessibility across breakpoints

**Tech Stack:** Next.js 16.2 App Router, Tailwind CSS 3, Inter font (Google Fonts), Feather Icons

---

## Global Constraints

- **Font:** Inter only (400, 500, 600 weights)
- **Colors:** Match hex values exactly (blue-700: `#2563EB`, slate-950: `#0F172A`, etc.)
- **Sidebar:** 240px fixed on desktop, collapsible on mobile
- **Cards:** 1px `#E2E8F0` border, no shadows, 12px radius
- **Responsive:** Mobile < 768px, Tablet 768–1024px, Desktop ≥ 1024px
- **Accessibility:** WCAG AA contrast (4.5:1 body, 3:1 large), focus rings 2px blue-700, semantic HTML
- **Icons:** Feather Icons 16x16px stroke-2 for nav, 18x18px stroke-2 for stat tiles
- **No destructive changes:** Keep existing API/data models untouched; CSS-only overhaul

---

## Task 1: Setup Tailwind Color Palette & Typography

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: existing Tailwind config
- Produces: color tokens (blue-700, slate-950, slate-600, etc.) and Inter font stack available in all components

### Steps

- [ ] **Step 1: Update tailwind.config.ts to extend colors**

Replace the `colors` section with:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0F172A',  // primary text, headings
          600: '#475569',  // secondary text
          400: '#94A3B8',  // tertiary text, labels
          200: '#E2E8F0',  // borders
          50: '#F8FAFC',   // hover backgrounds
        },
        blue: {
          900: '#1E40AF',  // button active
          800: '#1D4ED8',  // button hover
          700: '#2563EB',  // primary action, active nav
          50: '#EFF6FF',   // light backgrounds, active state
        },
        green: {
          600: '#16A34A',  // completed status
        },
        red: {
          600: '#DC2626',  // cancelled status
        },
        orange: {
          600: '#EA580C',  // no-show status
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Update app/globals.css to import Inter and define component classes**

Replace entire file with:

```css
/* app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #0F172A;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 400;
  line-height: 1.5;
}

/* Semantic component classes */

/* Buttons */
.btn-primary {
  @apply inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white rounded-lg font-medium text-sm transition;
}
.btn-primary:hover {
  @apply bg-blue-800;
}
.btn-primary:active {
  @apply bg-blue-900;
}
.btn-primary:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-normal text-sm transition;
}
.btn-secondary:hover {
  @apply bg-slate-50;
}
.btn-secondary:active {
  @apply bg-slate-100;
}

.btn-text {
  @apply inline-flex items-center gap-1 text-blue-700 font-normal text-sm transition;
}
.btn-text:hover {
  @apply text-blue-800 underline;
}

/* Cards */
.card {
  @apply bg-white border border-slate-200 rounded-2xl overflow-hidden;
}
.card-header {
  @apply flex items-center justify-between px-5 py-4 border-b border-slate-100;
}
.card-title {
  @apply font-semibold text-sm text-slate-950;
}
.card-body {
  @apply divide-y divide-slate-50;
}
.card-row {
  @apply flex items-center justify-between px-5 py-2.75 text-sm;
}

/* Badges */
.badge {
  @apply inline-flex items-center px-2 py-0.75 rounded-full text-xs font-medium;
}
.badge-scheduled {
  @apply bg-blue-50 text-blue-700;
}
.badge-completed {
  @apply bg-green-50 text-green-600;
}
.badge-cancelled {
  @apply bg-red-50 text-red-600;
}
.badge-no-show {
  @apply bg-orange-50 text-orange-600;
}

/* Forms */
.form-label {
  @apply block text-sm font-medium text-slate-950 mb-2;
}
.form-label .required {
  @apply text-blue-700;
}

.form-input,
.form-textarea,
.form-select {
  @apply w-full px-3 py-1.75 border border-slate-200 rounded-lg bg-white font-normal text-sm transition;
}
.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  @apply outline-none ring-2 ring-inset ring-blue-700 border-slate-200;
}
.form-input::placeholder {
  @apply text-slate-400;
}
.form-input:invalid,
.form-textarea:invalid,
.form-select:invalid {
  @apply border-red-600;
}

/* Sidebar */
.sidebar {
  @apply w-60 fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 flex flex-col overflow-y-auto;
}
.sidebar-brand {
  @apply flex items-center gap-2.5 px-5 py-5 border-b border-slate-100;
}
.sidebar-section {
  @apply px-3 py-4;
}
.sidebar-section-label {
  @apply text-xs font-medium text-slate-400 uppercase tracking-wider px-2 mb-1;
}
.nav-item {
  @apply flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-normal text-slate-600 hover:bg-slate-50 transition mb-0.5;
}
.nav-item.active {
  @apply bg-blue-50 text-blue-700 font-medium;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    @apply w-16 pt-16 h-screen;
  }
  .sidebar-brand {
    @apply flex-col gap-1;
  }
  .sidebar-section-label,
  .nav-item span:last-child {
    @apply hidden;
  }
}

@media (max-width: 768px) {
  .sidebar {
    @apply fixed w-full h-screen translate-x-full transition-transform;
  }
  .sidebar.open {
    @apply translate-x-0;
  }
}
```

- [ ] **Step 3: Run build to verify no errors**

```bash
npm run build
```

Expected: No errors; Tailwind and font imports successful.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: setup Tailwind color palette and Inter typography

- Add semantic color tokens (blue-700, slate-950, slate-600, etc.)
- Import Inter font (400, 500, 600 weights) from Google Fonts
- Define component utility classes (.btn-primary, .card, .badge, etc.)
- Update font family stack in Tailwind config"
```

---

## Task 2: Create Sidebar Component

**Files:**
- Create: `components/shared/Sidebar.tsx`

**Interfaces:**
- Consumes: `useSession()` hook (NextAuth), `useRouter()`, `usePathname()`
- Produces: exported default `Sidebar` component accepting no props, renders navigation sidebar with role-specific links

### Steps

- [ ] **Step 1: Create Sidebar.tsx with desktop layout**

```typescript
// components/shared/Sidebar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const patientLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "grid" },
    { href: "/appointments", label: "Appointments", icon: "calendar" },
    { href: "/appointments/book", label: "Book Appointment", icon: "plus" },
    { href: "/prescriptions", label: "Prescriptions", icon: "pill" },
    { href: "/profile", label: "Profile", icon: "user" },
  ];

  const doctorLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "grid" },
    { href: "/doctor/patients", label: "Patients", icon: "users" },
    { href: "/doctor/my-prescriptions", label: "Prescriptions", icon: "pill" },
    { href: "/doctor/schedule", label: "Schedule", icon: "clock" },
    { href: "/settings", label: "Settings", icon: "settings" },
  ];

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "grid" },
    { href: "/admin/users", label: "Users", icon: "users" },
    { href: "/admin/appointments", label: "Appointments", icon: "calendar" },
    { href: "/admin/schedule", label: "Schedule", icon: "clock" },
    { href: "/settings", label: "Settings", icon: "settings" },
  ];

  const getLinks = () => {
    if (session.user.role === "patient") return patientLinks;
    if (session.user.role === "doctor") return doctorLinks;
    if (session.user.role === "admin") return adminLinks;
    return [];
  };

  const navLinks = getLinks();

  const getIconSVG = (icon: string) => {
    const icons: Record<string, string> = {
      grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
      pill: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 8-8 8-8-8z"/></svg>`,
      user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m0 5.08l-4.24 4.24M1 12h6m6 0h6m-5.78-5.78l4.24-4.24m0 5.08l-4.24 4.24M20 4.22v0m0 11.56v0"/></svg>`,
      exit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    };
    return icons[icon] || "";
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 text-slate-950"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar md:translate-x-0 z-40 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="hidden md:block">
            <div className="font-semibold text-sm text-slate-950">Medicus</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              {session.user.role}
            </div>
          </div>
        </div>

        {/* Nav section */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">Main</div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`nav-item ${isActive(link.href) ? "active" : ""}`}
            >
              <div
                className="w-4 h-4 flex-shrink-0"
                dangerouslySetInnerHTML={{ __html: getIconSVG(link.icon) }}
              />
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* User section */}
        <div className="mt-auto border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 p-2">
            <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block min-w-0">
              <div className="text-xs font-medium text-slate-950 truncate">{session.user.name}</div>
              <div className="text-xs text-slate-400">{session.user.role}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="ml-auto p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
              aria-label="Sign out"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                dangerouslySetInnerHTML={{
                  __html: getIconSVG("exit"),
                }}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden md:block w-60 flex-shrink-0" />
    </>
  );
}
```

- [ ] **Step 2: Test sidebar renders on a page**

Edit `app/dashboard/page.tsx` temporarily to import and render `<Sidebar />` at the top to verify it displays correctly. Don't commit changes yet.

Expected: Sidebar appears on left side (desktop) or hidden on mobile; click hamburger to show/hide on mobile.

- [ ] **Step 3: Remove test import and commit**

```bash
git add components/shared/Sidebar.tsx
git commit -m "feat: create Sidebar navigation component

- Left-fixed 240px sidebar on desktop, collapsible overlay on mobile
- Role-based navigation links (patient/doctor/admin)
- Feather-style icons (16x16px, 2px stroke)
- Active state highlighting (blue-50 bg, blue-700 text)
- User info + sign-out button in footer
- Responsive: icon-only on tablet, full width overlay on mobile"
```

---

## Task 3: Create TopBar Component

**Files:**
- Create: `components/shared/TopBar.tsx`

**Interfaces:**
- Consumes: `usePathname()`, optional children for action buttons
- Produces: exported default `TopBar` component accepting optional `actions` prop (React.ReactNode)

### Steps

- [ ] **Step 1: Create TopBar.tsx**

```typescript
// components/shared/TopBar.tsx
"use client";

import { usePathname } from "next/navigation";

interface TopBarProps {
  title?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, actions }: TopBarProps) {
  const pathname = usePathname();

  // Generate title from pathname if not provided
  const getTitleFromPath = () => {
    if (title) return title;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    return segments[segments.length - 1]
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="fixed md:ml-60 top-0 right-0 left-0 md:left-60 h-16 bg-white border-b border-slate-200 z-30">
      <div className="h-full px-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-950 -tracking-wide">
            {getTitleFromPath()}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{today}</p>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test TopBar renders**

Edit `app/dashboard/page.tsx` to wrap TopBar above main content. Verify title and date display.

Expected: White bar fixed at top, page title + today's date visible, responsive margin on mobile.

- [ ] **Step 3: Remove test import and commit**

```bash
git add components/shared/TopBar.tsx
git commit -m "feat: create TopBar sticky header component

- Fixed top bar (64px height) with page title + date
- Auto-generates title from pathname or accepts custom title
- Accepts optional actions (buttons) on the right
- Responsive margin adjustment for mobile"
```

---

## Task 4: Create MainLayout Wrapper

**Files:**
- Create: `components/shared/MainLayout.tsx`

**Interfaces:**
- Consumes: `Sidebar`, `TopBar` components, `useSession()`
- Produces: exported default `MainLayout` component accepting `children` and optional `topBarTitle`, `topBarActions`

### Steps

- [ ] **Step 1: Create MainLayout.tsx**

```typescript
// components/shared/MainLayout.tsx
"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import PageLoader from "./PageLoader";
import { useSession } from "next-auth/react";

interface MainLayoutProps {
  children: ReactNode;
  topBarTitle?: string;
  topBarActions?: ReactNode;
}

export default function MainLayout({
  children,
  topBarTitle,
  topBarActions,
}: MainLayoutProps) {
  const { status } = useSession();

  if (status === "loading") return <PageLoader />;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 md:ml-60">
        <TopBar title={topBarTitle} actions={topBarActions} />
        <main className="mt-16 px-8 py-7 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in TypeScript**

```bash
npm run build
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/MainLayout.tsx
git commit -m "feat: create MainLayout wrapper combining Sidebar and TopBar

- Combines Sidebar + TopBar + content area
- Handles loading state with PageLoader
- Accepts optional topBarTitle and topBarActions
- Provides consistent margins and spacing"
```

---

## Task 5: Update AppointmentCard Badge Styling

**Files:**
- Modify: `components/shared/AppointmentCard.tsx`

**Interfaces:**
- Consumes: existing appointment data
- Produces: same component with new badge classes and colors

### Steps

- [ ] **Step 1: Update AppointmentCard.tsx badge styling**

Replace the `STATUS_STYLES` object and badge rendering:

```typescript
// components/shared/AppointmentCard.tsx
// (Replace existing STATUS_STYLES and badge rendering)

const STATUS_BADGES: Record<string, string> = {
  scheduled: "badge badge-scheduled",
  completed: "badge badge-completed",
  cancelled: "badge badge-cancelled",
  "no-show": "badge badge-no-show",
};

// In the return JSX, replace the status badge:
<span className={`${STATUS_BADGES[appointment.status] ?? "badge"}`}>
  {appointment.status}
</span>
```

- [ ] **Step 2: Test badge colors**

Visually verify each status color matches spec (scheduled: blue-50/blue-700, completed: green-50/green-600, etc.).

- [ ] **Step 3: Commit**

```bash
git add components/shared/AppointmentCard.tsx
git commit -m "refactor: update AppointmentCard to use new badge classes

- Replace inline badge styles with .badge-* component classes
- Scheduled: blue-50 bg, blue-700 text
- Completed: green-50 bg, green-600 text
- Cancelled: red-50 bg, red-600 text
- No-show: orange-50 bg, orange-600 text"
```

---

## Task 6: Update All Card Components to Match New Design

**Files:**
- Modify: `components/shared/PrescriptionCard.tsx`
- Modify: `components/shared/ProfileCard.tsx`

**Interfaces:**
- Consumes: existing prop types
- Produces: same components with updated 1px border, no shadow, 12px radius

### Steps

- [ ] **Step 1: Update PrescriptionCard.tsx**

Replace the card wrapper div:

```typescript
// From:
<div className="p-4 border rounded-lg shadow-sm">

// To:
<div className="card">
  <div className="card-body">
    {/* content */}
  </div>
</div>
```

- [ ] **Step 2: Update ProfileCard.tsx**

Same pattern as above — replace old card styling with `.card` class.

- [ ] **Step 3: Verify both cards render correctly**

Check styling in browser — borders should be crisp, shadows removed, rounded corners consistent.

- [ ] **Step 4: Commit**

```bash
git add components/shared/PrescriptionCard.tsx components/shared/ProfileCard.tsx
git commit -m "refactor: update card components to match new design

- Apply .card class wrapper (1px border, 12px radius, no shadow)
- Consistent card styling across all components
- Remove legacy box-shadow and border-radius styles"
```

---

## Task 7: Update Patient Dashboard to Use New Layout

**Files:**
- Modify: `app/dashboard/page.tsx` (patient section)

**Interfaces:**
- Consumes: existing appointment and prescription data
- Produces: patient dashboard wrapped in MainLayout with proper spacing and grid

### Steps

- [ ] **Step 1: Wrap patient dashboard in MainLayout**

At the top of the patient dashboard return:

```typescript
return (
  <MainLayout topBarTitle="Dashboard">
    <div className="space-y-8">
      {/* existing content */}
    </div>
  </MainLayout>
);
```

- [ ] **Step 2: Update grid layout for appointments/prescriptions**

Ensure they use the 2-column grid on desktop:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  {/* appointments card */}
  {/* prescriptions card */}
</div>
```

- [ ] **Step 3: Verify responsive behavior**

Test on desktop (2 columns), tablet, and mobile (1 column stack).

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "refactor: update patient dashboard to use MainLayout

- Wrap dashboard in MainLayout (sidebar + topbar)
- Apply responsive grid (2 cols desktop, 1 col mobile)
- Remove old navigation code"
```

---

## Task 8: Update Doctor Dashboard

**Files:**
- Modify: `app/dashboard/page.tsx` (doctor section)

**Interfaces:**
- Consumes: existing appointments and patients data
- Produces: doctor dashboard in MainLayout with 2-column card layout

### Steps

- [ ] **Step 1: Wrap doctor section in MainLayout**

```typescript
return (
  <MainLayout topBarTitle="Dashboard">
    {/* content */}
  </MainLayout>
);
```

- [ ] **Step 2: Verify grid and card styling**

Ensure 2-column layout on desktop, single column on mobile.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "refactor: update doctor dashboard to use MainLayout

- Wrap in MainLayout with sidebar + topbar
- Apply responsive grid for appointments/patients cards
- Consistent spacing and card styling"
```

---

## Task 9: Update Admin Dashboard & Stat Tiles

**Files:**
- Modify: `app/dashboard/page.tsx` (admin section)
- Modify: `app/globals.css` (add stat-tile component class)

**Interfaces:**
- Consumes: appointments, shifts data
- Produces: admin dashboard with 3-column stat tiles, 2-column card grid below

### Steps

- [ ] **Step 1: Add stat-tile component class to globals.css**

```css
/* Add to globals.css */
.stat-tile {
  @apply card flex items-start gap-3.5 p-5;
}
.stat-icon {
  @apply w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0;
}
.stat-icon.blue {
  @apply bg-blue-50 text-blue-700;
}
.stat-icon.green {
  @apply bg-green-50 text-green-600;
}
.stat-icon.amber {
  @apply bg-amber-50 text-amber-600;
}
.stat-value {
  @apply text-2xl font-semibold text-slate-950 -tracking-wider;
}
.stat-label {
  @apply text-xs text-slate-400 font-normal mt-1;
}
```

- [ ] **Step 2: Update admin dashboard stat tiles**

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <div className="stat-tile">
    <div className="stat-icon blue">
      {/* calendar + checkmark icon */}
    </div>
    <div>
      <div className="stat-value">{todayAppointments.length}</div>
      <div className="stat-label">Today's Appointments</div>
    </div>
  </div>
  
  <div className="stat-tile">
    <div className="stat-icon green">
      {/* person + checkmark icon */}
    </div>
    <div>
      <div className="stat-value">{staffOnDuty.size}</div>
      <div className="stat-label">Staff on Duty</div>
    </div>
  </div>
  
  <div className="stat-tile">
    <div className="stat-icon amber">
      {/* bar chart icon */}
    </div>
    <div>
      <div className="stat-value">{appointments.length}</div>
      <div className="stat-label">Total Appointments</div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Wrap admin section in MainLayout**

```typescript
return (
  <MainLayout topBarTitle="Dashboard">
    {/* stat tiles + card grids */}
  </MainLayout>
);
```

- [ ] **Step 4: Test responsive stat tiles**

Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/dashboard/page.tsx
git commit -m "refactor: update admin dashboard with stat tiles and MainLayout

- Add .stat-tile component class with icon badges
- Render 3 stat tiles (today's apts, staff on duty, total apts)
- Color-coded icons (blue for counts, green for active, amber for totals)
- Responsive grid (3 cols desktop, 2 cols tablet, 1 col mobile)
- Wrap entire dashboard in MainLayout"
```

---

## Task 10: Update Navigation Component to Sidebar Only

**Files:**
- Modify: `components/shared/Navigation.tsx` (or deprecate)
- Modify: `app/layout.tsx` (root layout to use MainLayout wrapper)

**Interfaces:**
- Consumes: none (old Navigation component)
- Produces: removed or stubbed Navigation component; root layout uses Sidebar via MainLayout

### Steps

- [ ] **Step 1: Update root app/layout.tsx to use Sidebar**

Replace old Navigation import with MainLayout wrapper. The root layout should no longer render Navigation.

```typescript
// app/layout.tsx
import MainLayout from "@/components/shared/MainLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* existing head */}
      </head>
      <body>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Remove old Navigation.tsx import from layout**

```bash
# Verify Navigation is no longer imported or referenced
grep -r "Navigation" app/layout.tsx
```

Expected: No results (Navigation not referenced).

- [ ] **Step 3: Keep Navigation.tsx for backward compatibility (deprecated)**

Don't delete it yet; just comment at top:

```typescript
// components/shared/Navigation.tsx
// DEPRECATED: Use Sidebar component via MainLayout wrapper instead
// Kept for reference during transition period
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx components/shared/Navigation.tsx
git commit -m "refactor: replace Navigation with Sidebar in root layout

- Update root layout.tsx to use MainLayout wrapper
- MainLayout provides Sidebar + TopBar + content area
- Deprecate old Navigation component (kept for reference)
- All pages now inherit new navigation structure"
```

---

## Task 11: Update Remaining Pages to Use MainLayout

**Files:**
- Modify: `app/appointments/page.tsx`
- Modify: `app/prescriptions/page.tsx`
- Modify: `app/(patient)/appointments/book/page.tsx`
- Modify: `app/profile/page.tsx`
- Modify: `app/settings/page.tsx`
- Modify: `app/admin/appointments/page.tsx`
- Modify: `app/admin/schedule/page.tsx`
- Modify: `app/admin/users/page.tsx`
- Modify: `app/doctor/patients/page.tsx`
- Modify: `app/doctor/patients/[id]/page.tsx`
- Modify: `app/doctor/my-prescriptions/page.tsx`
- Modify: `app/doctor/schedule/page.tsx`
- Modify: `app/admin/doctors/[id]/page.tsx`

**Interfaces:**
- Consumes: existing page components
- Produces: same pages wrapped in MainLayout with proper titles

### Steps

- [ ] **Step 1: Create list of all pages to update**

All authenticated pages (every page under `app/` except `app/page.tsx` landing and `app/login`, `app/signup`).

- [ ] **Step 2: For each page, wrap main return in MainLayout**

Template:

```typescript
return (
  <MainLayout topBarTitle="Page Title">
    {/* existing content, possibly re-wrapped in adjusted divs */}
  </MainLayout>
);
```

Remove old `min-h-screen` and padding; MainLayout handles layout.

- [ ] **Step 3: Test each page**

Quickly load each page in browser to verify:
- Sidebar visible on desktop
- TopBar title correct
- Content doesn't have extra padding
- Responsive works on mobile

- [ ] **Step 4: Commit in batches**

Commit pages by role/category:

```bash
# Patient pages
git add app/appointments/page.tsx app/prescriptions/page.tsx app/profile/page.tsx app/\(patient\)/appointments/book/page.tsx
git commit -m "refactor: wrap patient pages in MainLayout

- app/appointments/page.tsx
- app/prescriptions/page.tsx
- app/(patient)/appointments/book/page.tsx
- app/profile/page.tsx

Remove old navigation and padding; MainLayout provides layout"
```

```bash
# Doctor pages
git add app/doctor/patients/page.tsx app/doctor/patients/[id]/page.tsx app/doctor/my-prescriptions/page.tsx app/doctor/schedule/page.tsx
git commit -m "refactor: wrap doctor pages in MainLayout

- app/doctor/patients/page.tsx
- app/doctor/patients/[id]/page.tsx
- app/doctor/my-prescriptions/page.tsx
- app/doctor/schedule/page.tsx"
```

```bash
# Admin pages
git add app/admin/appointments/page.tsx app/admin/schedule/page.tsx app/admin/users/page.tsx app/admin/doctors/[id]/page.tsx app/settings/page.tsx
git commit -m "refactor: wrap admin + settings pages in MainLayout

- app/admin/appointments/page.tsx
- app/admin/schedule/page.tsx
- app/admin/users/page.tsx
- app/admin/doctors/[id]/page.tsx
- app/settings/page.tsx"
```

---

## Task 12: Update Form Styling Across Pages

**Files:**
- Modify: All pages containing forms (patient profile, doctor schedule, admin schedule, settings, appointment booking, etc.)

**Interfaces:**
- Consumes: existing form markup
- Produces: forms using new `.form-label`, `.form-input`, `.form-select` classes

### Steps

- [ ] **Step 1: Identify all forms in codebase**

```bash
grep -r "input\|textarea\|select" app --include="*.tsx" | grep -E "type=|className" | head -20
```

Focus on: patient profile edit, doctor schedule create/edit, admin schedule, settings password change, appointment booking.

- [ ] **Step 2: Update form markup template**

Replace old form styling:

```typescript
// From:
<input className="border px-3 py-2 rounded" />

// To:
<input className="form-input" />
```

Same for `<textarea className="form-textarea" />` and `<select className="form-select" />`.

Add label wrappers:

```typescript
<label className="form-label">
  Field Name
  <span className="required">*</span>
</label>
<input className="form-input" />
```

- [ ] **Step 3: Update button styling in forms**

Replace button styling:

```typescript
// From:
<button className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>

// To:
<button className="btn-primary">Submit</button>
```

- [ ] **Step 4: Test forms on multiple pages**

Verify inputs focus, labels are associated, buttons style correctly, placeholder text visible.

- [ ] **Step 5: Commit**

```bash
git add app/profile/page.tsx app/settings/page.tsx app/\(patient\)/appointments/book/page.tsx app/doctor/schedule/page.tsx app/admin/schedule/page.tsx
git commit -m "refactor: update form styling to use new component classes

- Apply .form-input, .form-textarea, .form-select classes
- Apply .form-label for field labels with .required marks
- Replace inline button styles with .btn-primary, .btn-secondary
- Consistent form validation and focus states"
```

---

## Task 13: Test Responsive Design Across Breakpoints

**Files:**
- No file changes (testing only)

**Interfaces:**
- Consumes: all updated pages
- Produces: verified responsive behavior on mobile/tablet/desktop

### Steps

- [ ] **Step 1: Test on mobile (< 768px)**

Use browser DevTools to simulate iPhone 12 (390px width).

Check:
- Sidebar hidden, hamburger visible ✓
- TopBar full-width ✓
- Content single-column, no overflow ✓
- Stat tiles 1 per row ✓
- Cards full-width ✓
- Fonts readable, no tiny text ✓

- [ ] **Step 2: Test on tablet (768px–1024px)**

Simulate iPad (820px width).

Check:
- Sidebar collapses to icon-only (60px) or bottom nav ✓
- TopBar adjusts margin ✓
- Stat tiles 2 per row ✓
- Cards in 2-column grid where applicable ✓

- [ ] **Step 3: Test on desktop (≥ 1024px)**

Full-screen browser.

Check:
- Sidebar 240px fixed on left ✓
- TopBar has left margin for sidebar ✓
- Stat tiles 3 per row ✓
- 2-column card grids ✓
- Spacing matches spec (32px padding, 16px gaps) ✓

- [ ] **Step 4: No commit** (testing only)

---

## Task 14: Verify Accessibility (WCAG AA)

**Files:**
- No file changes (audit only)

**Interfaces:**
- Consumes: all updated pages
- Produces: verified accessibility compliance

### Steps

- [ ] **Step 1: Check color contrast**

Use browser DevTools (Lighthouse) or WebAIM Color Contrast Checker on:
- Text on white backgrounds (should be 4.5:1+)
- Text on colored backgrounds (badges, buttons)

Spot check on:
- Page title (slate-950 on white) ✓
- Secondary text (slate-600 on white) ✓
- Badge text (blue-700 on blue-50) ✓
- Button text (white on blue-700) ✓

- [ ] **Step 2: Check focus states**

Tab through sidebar nav, buttons, form inputs.

Verify:
- 2px blue-700 ring visible on focus ✓
- Focus never hidden or confused ✓
- Focus order logical (left-to-right, top-to-bottom) ✓

- [ ] **Step 3: Check semantic HTML**

Verify in DevTools Inspector:
- Navigation wrapped in `<nav>` ✓
- Buttons are `<button>` elements ✓
- Links are `<a>` elements ✓
- Form inputs have associated `<label>` elements ✓
- Icons with aria-label where not paired with text ✓

- [ ] **Step 4: No commit** (audit only)

---

## Task 15: Final Design Verification & Commit

**Files:**
- No changes (visual verification only)

**Interfaces:**
- Consumes: all updated pages, design spec mockup
- Produces: verified alignment with spec

### Steps

- [ ] **Step 1: Visually compare against mockup**

Open mockup at `.superpowers/brainstorm/796-1783953846/content/dashboard-mockup.html` in one window, app in another.

Compare:
- Sidebar layout (240px, brand, nav items, user section) ✓
- TopBar styling (64px, title + date, sticky) ✓
- Card styling (1px border, 12px radius, no shadow) ✓
- Stat tiles (icon badge + value + label) ✓
- Badge colors (scheduled/completed/cancelled/no-show) ✓
- Spacing and alignment ✓

- [ ] **Step 2: Verify colors match hex exactly**

Sample colors with DevTools color picker and compare to spec hex values:
- Blue-700: `#2563EB` ✓
- Slate-950: `#0F172A` ✓
- Stat tile borders: `#E2E8F0` ✓

- [ ] **Step 3: Verify typography matches**

Check font sizes and weights on key elements:
- Page title: 18px, 600wt ✓
- Card heading: 13.5px, 600wt ✓
- Body text: 13px, 400wt ✓
- Nav label: 13.5px, 500wt active ✓

- [ ] **Step 4: Create final summary commit**

```bash
git log --oneline | head -15
# Should show ~15 commits for this overhaul
```

If all verified, create a summary tag:

```bash
git tag -a v1.0-ux-overhaul -m "Complete UX overhaul: sidebar nav, refined colors, new typography

- Sidebar navigation (240px fixed, collapsible mobile)
- Clean card treatment (1px borders, 12px radius)
- Refined blue palette + semantic status colors
- Inter typography (400/500/600 weights)
- MainLayout wrapper for consistent structure
- All pages updated and responsive
- WCAG AA accessibility verified"
```

---

## Success Criteria Checklist

- [ ] Sidebar navigation renders correctly on desktop/mobile
- [ ] TopBar sticky header with title + date works
- [ ] All color hex values match spec exactly
- [ ] Typography follows 400/500/600 weight hierarchy
- [ ] Cards have 1px `#E2E8F0` borders, no shadows
- [ ] Stat tiles render with icon badges + value + label
- [ ] Badges color-code by status (scheduled/completed/cancelled/no-show)
- [ ] Forms use `.form-input`, `.form-label`, `.form-select` classes
- [ ] Buttons use `.btn-primary`, `.btn-secondary` classes
- [ ] Responsive layout works: mobile (1 col), tablet (2 col), desktop (2-3 col)
- [ ] Mobile sidebar hidden by default, hamburger toggles it
- [ ] Stat tiles: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] Focus rings visible on all interactive elements (2px blue-700)
- [ ] All text meets WCAG AA contrast (4.5:1 body, 3:1 large)
- [ ] No console errors or warnings
- [ ] Design matches mockup visually
- [ ] All 15+ implementation commits completed
