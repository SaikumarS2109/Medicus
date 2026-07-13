# Medicus UX Overhaul — Design Specification

**Date:** July 13, 2026  
**Status:** Design Approved  
**Audience:** Development Team

---

## Executive Summary

Medicus is transitioning from a generic default-Tailwind interface to a **modern, clean healthcare portal** with a professional, intentional design system. The overhaul focuses on:

- **Left-side navigation** with role-labeled sections and icon support
- **Clean & clinical card treatment** — 1px borders, no shadows, generous whitespace
- **Refined blue palette** with neutral grays and semantic status colors
- **Lighter typography** using Inter with 400/500/600 weights only
- **Consistent iconography** across navigation, stat tiles, and quick actions
- **Role-specific dashboards** (patient, doctor, admin) that reuse the same component system

The design is **portfolio-grade** — every pixel is intentional, every color is purposeful, and the system scales cleanly across mobile/tablet/desktop.

---

## Design Principles

1. **Intentionality over defaults** — Every design choice is deliberate, not accidental Tailwind
2. **Clarity & trust** — Healthcare users need confidence; clean lines and precise spacing build that
3. **Role-aware** — Different users see different information; the navigation and dashboards adapt to role
4. **Accessibility first** — Proper contrast (WCAG AA), focus states, and semantic HTML
5. **Mobile-first responsive** — Sidebar collapses, grid adapts, nothing breaks on mobile

---

## Color System

### Primary Brand

| Use | Hex | Tailwind |
|-----|-----|----------|
| Action buttons, links, active states | `#2563EB` | `blue-700` |
| Button hover | `#1D4ED8` | `blue-800` |
| Light backgrounds, active nav | `#EFF6FF` | `blue-50` |

### Neutral Scale

| Use | Hex | Tailwind |
|-----|-----|----------|
| Headings, primary text | `#0F172A` | `slate-950` |
| Secondary text | `#475569` | `slate-600` |
| Tertiary text, labels | `#94A3B8` | `slate-400` |
| Borders, dividers | `#E2E8F0` | `slate-200` |
| Hover backgrounds | `#F8FAFC` | `slate-50` |
| Cards, panels | `#fff` | `white` |

### Semantic Status Colors

| Status | Hex | Usage |
|--------|-----|-------|
| Completed (green) | `#16A34A` | Appointment completed, active status |
| Cancelled (red) | `#DC2626` | Cancelled appointment |
| No-show (orange) | `#EA580C` | Appointment no-show |
| Scheduled (blue) | `#2563EB` | Default appointment status |

### Stat Tile Icon Colors

- **Blue tint** (`#EFF6FF` bg, `#2563EB` icon) — count-based metrics
- **Green tint** (`#F0FDF4` bg, `#16A34A` icon) — active/positive metrics  
- **Amber tint** (`#FFFBEB` bg, `#D97706` icon) — informational/total metrics

---

## Typography

**Font Family:** Inter (Google Fonts)  
**Weights:** 400, 500, 600 only (no 700)  
**Line-height:** 1.5 for body text, 1.1 for numbers/headings

### Type Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Page title | 18px | 600 | Dashboard, main page headings |
| Card heading | 13.5px | 600 | Section titles within cards |
| Nav labels | 13.5px | 400 normal, 500 active | Sidebar navigation links |
| Body text | 13px | 400 | Main content, descriptions |
| Secondary text | 12px | 400 | Subheadings, metadata |
| Labels, captions | 11px–12px | 400 | Form labels, small text |
| Section headers | 10px | 500 | Uppercase section dividers |

**Letter-spacing:**
- Headings: `-0.02em` (tight)
- Section labels: `0.05em` to `0.08em` (uppercase, tracked)
- Body: normal (0)

---

## Components

### Buttons

**Primary Button**
- Background: `#2563EB` (blue-700)
- Text: white, 13px, 500wt
- Padding: 8px vert / 16px horiz
- Radius: 8px
- Icon: optional, 16x16px, 6px gap before label
- Hover: `#1D4ED8` (blue-800)
- Active: `#1E40AF` (blue-900)
- State: disabled reduces opacity to 50%

**Secondary Button**
- Background: white
- Border: 1px `#E2E8F0`
- Text: `#475569`, 13px, 400wt
- Padding: 8px vert / 14px horiz
- Radius: 8px
- Hover: `#F8FAFC` (slate-50)
- Active: `#F1F5F9` (slate-100)

**Text Button** (link-style)
- No background, no border
- Text: `#2563EB`, 13px, 400wt
- Hover: underline, text becomes `#1D4ED8`
- Use for secondary actions or inline navigation

### Cards

- **Background:** white
- **Border:** 1px `#E2E8F0`
- **Radius:** 12px
- **Shadow:** none (border-only aesthetic)
- **Header padding:** 16px
- **Header border-bottom:** 1px `#F1F5F9`
- **Body padding:** 11px vert / 20px horiz per row
- **Row dividers:** 1px `#F8FAFC` between rows

### Badges / Status Pills

- **Padding:** 3px vert / 8px horiz
- **Radius:** 99px (fully rounded)
- **Font:** 10.5px, 500wt
- **Variants:**
  - Scheduled: `#EFF6FF` bg, `#2563EB` text
  - Completed: `#F0FDF4` bg, `#16A34A` text
  - Cancelled: `#FEF2F2` bg, `#DC2626` text
  - No-show: `#FFF7ED` bg, `#EA580C` text

### Form Elements

**Text Inputs, Textareas, Selects**
- Border: 1px `#E2E8F0`
- Radius: 8px
- Padding: 8px horiz / 7px vert
- Font: Inter 13px, 400wt
- Placeholder: `#94A3B8`
- Background: white
- Focus: 2px inset blue-700 ring, border stays slate-200
- Invalid: border becomes 1px `#DC2626`

**Labels**
- Font: 12px, 500wt, `#0F172A`
- Margin-bottom: 8px
- Required mark: `*` in blue-700

**Checkboxes & Radios**
- Size: 16x16px
- Border: 1px `#E2E8F0`, 8px radius
- Checked: blue-700 fill with white checkmark
- Hover: `#F8FAFC` background

### Stat Tiles

- **Background:** white
- **Border:** 1px `#E2E8F0`
- **Radius:** 12px
- **Padding:** 20px
- **Layout:** flex row, gap 14px
- **Icon badge:** 38x38px square, 10px radius, tinted background (blue/green/amber)
- **Icon:** 18x18px stroke weight 2
- **Value:** 26px, 600wt, slate-950
- **Label:** 12px, 400wt, slate-400

---

## Spacing & Layout

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Small gaps, list separators |
| sm | 8px | Button padding vert, form gaps |
| md | 12px | Card padding, component gaps |
| lg | 16px | Card padding horiz, medium gaps |
| xl | 20px | Stat tile padding, section padding |
| 2xl | 24px | Between major sections |
| 3xl | 32px | Page content padding |

### Page Layout

- **Sidebar width:** 240px (fixed on desktop, collapses on tablet/mobile)
- **Sidebar border-right:** 1px `#E2E8F0`
- **Top bar height:** 64px (sticky, white bg, bottom border 1px `#E2E8F0`)
- **Content padding:** 32px horiz, 28px vert
- **Max-width:** none (full-width to sidebar edge)

### Grid Systems

**Stat tiles row:** 
- Desktop: 3 columns, 16px gap
- Tablet: 2 columns, 16px gap
- Mobile: 1 column, 16px gap

**Card rows (appointments, prescriptions):**
- Desktop: 2 columns, 16px gap
- Tablet: 1 column, 16px gap
- Mobile: 1 column, 16px gap

**Quick actions list:** 
- Full-width list, no columns

---

## Navigation System

### Sidebar Structure

**Desktop (240px fixed):**
- Brand section (logo + name + role label): 20px padding-top, 16px padding-bottom, bottom border 1px `#F1F5F9`
- Section groups (Main, Admin): 16px padding top/bottom, labels in uppercase 10px 500wt slate-400
- Nav items: 13.5px, 400wt normal / 500wt active, 8px padding, 8px radius, gap 10px icon
- Active state: `#EFF6FF` bg, `#2563EB` text, icon colored blue-700
- Hover state: `#F8FAFC` bg
- User section: bottom of sidebar, 12px padding, 32px avatar badge, 28px user name (12.5px 500wt), 10.5px role label (gray-400)
- Sign-out button: icon only, hover turns red

**Tablet (768px–1024px):**
- Sidebar collapses to icon-only (60px width)
- Label hidden, icon centered
- Expand on hover to show full nav
- Or: keep compact at bottom as icon bar (mobile-style)

**Mobile (< 768px):**
- Overlay sidebar, triggered by hamburger menu in top-left
- Full width, slides in from left
- Closes on nav click

### Nav Items & Icons

Each nav link has an icon (16x16px, 2px stroke weight) + label:
- Dashboard: grid or house icon
- Appointments: calendar icon
- Users: people icon
- Schedule: clock icon
- Patients: person icon
- Prescriptions: pill icon
- Settings: gear icon
- Sign out: exit/logout icon

---

## Page Layouts

### Patient Dashboard

**Layout:**
- Two-column grid (1 col on mobile)
- Left: Upcoming appointments (card, scrollable list, max-height 400px)
- Right: Active prescriptions (card, scrollable list)
- Below: Medical record summary (full-width card)

**Quick actions:**
- "Book Appointment" button in top bar
- "Edit Profile" link in medical record card

### Doctor Dashboard

**Layout:**
- Two-column grid
- Left: Today's appointments (card, status-filterable)
- Right: Your patients (card, 5 most recent, "View Full Record" links)
- Below: Links to "Manage Prescriptions" and "Schedule"

**Stat context:**
- No stat tiles (patients/appointments shown inline in cards)

### Admin Dashboard

**Layout:**
- Stat tiles row (3 columns: today's apts, staff on duty, total apts)
- Two-column grid below:
  - Left: Quick actions (card, 3 items: Manage Schedule, Manage Users, View All Appointments)
  - Right: Today's appointments (card, 5 most recent appointments)

**Stat tiles icons:**
- Today's appointments: calendar + checkmark, blue
- Staff on duty: person + checkmark, green
- Total appointments: bar chart, amber

---

## Responsive Behavior

### Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px–1024px
- **Desktop:** ≥ 1024px

### Key Changes

**Mobile:**
- Sidebar hidden (overlay on menu click)
- Top bar takes full width
- All cards full-width, stacked (1 column)
- Stat tiles: 1 per row
- Font sizes reduced by 1px where possible (13px → 12px body, etc.)
- Padding: 16px instead of 32px

**Tablet:**
- Sidebar collapses to icon-only or bottom nav bar
- Cards: 2-column grid where applicable
- Stat tiles: 2 per row
- Normal font sizes

**Desktop:**
- Full sidebar (240px fixed)
- Normal layout as designed
- 2–3 column grids
- Normal spacing

---

## Accessibility

- **Contrast:** All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **Focus states:** 2px blue ring on all interactive elements
- **Icons:** Always paired with text (nav items, buttons) or have aria-label
- **Forms:** Labels explicitly associated with inputs (for/id)
- **Color:** Never rely on color alone (status badges include text)
- **Keyboard:** All navigation fully keyboard-accessible (Tab through sidebar, buttons, form fields)
- **Semantic HTML:** Use `<button>`, `<a>`, `<form>`, `<nav>` appropriately

---

## Implementation Notes

### CSS Architecture

- Use Tailwind CSS as utility framework
- Create custom component classes for complex units (`.btn-primary`, `.stat-tile`, `.sidebar-nav-item`)
- Maintain custom CSS variable definitions for color palette (in `globals.css`)
- No CSS-in-JS; keep stylesheet approach

### Font Loading

- Import Inter via Google Fonts (preconnect for performance)
- Weights: 400, 500, 600 only
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Color Palette in Code

Use Tailwind's extended config to define semantic token names:

```javascript
extend: {
  colors: {
    slate: {
      950: '#0F172A',
      600: '#475569',
      400: '#94A3B8',
      200: '#E2E8F0',
      50: '#F8FAFC',
    },
    blue: {
      700: '#2563EB',  // primary action
      800: '#1D4ED8',  // hover
      50: '#EFF6FF',   // light bg
    },
  }
}
```

### Icon System

- Use Feather Icons or Hero Icons (open-source, 16x18px)
- Stroke weight: 2px for nav, buttons
- Solid fill for stat tile icons
- Color via `currentColor` or explicit class

### Component Conventions

- Sidebar: `.sidebar`, `.sidebar-brand`, `.sidebar-section`, `.nav-item`, `.nav-item.active`
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-text`
- Cards: `.card`, `.card-header`, `.card-body`, `.card-title`
- Badges: `.badge`, `.badge-blue`, `.badge-green`, etc.
- Forms: `.form-label`, `.form-input`, `.form-error`

---

## Files to Update / Create

### New Files

- `components/shared/Sidebar.tsx` — Left navigation component
- `components/shared/TopBar.tsx` — Sticky header with page title + actions
- `tailwind.config.ts` — Update color palette and extend theme

### Modified Files

- `app/globals.css` — Import Inter, update CSS variables, custom component styles
- `components/shared/Navigation.tsx` → retire (replace with Sidebar)
- All page components (`app/**/page.tsx`) — adopt new layout (sidebar + topbar wrapper)
- All card components — update styles to match new card treatment

---

## Success Criteria

✓ Design matches mockup in [dashboard-mockup.html](../../../.superpowers/brainstorm/796-1783953846/content/dashboard-mockup.html)  
✓ All colors match hex values in this spec  
✓ Typography follows weight and size hierarchy  
✓ Sidebar is fixed on desktop, collapses on mobile  
✓ Cards have 1px borders, no shadows  
✓ Icons appear in nav and stat tiles  
✓ All pages (patient, doctor, admin dashboards) render correctly  
✓ Responsive layout works on mobile/tablet/desktop  
✓ WCAG AA contrast on all text  
✓ Focus states visible on all interactive elements  

---

## Appendix: Color Reference

### Hex to Tailwind Mapping

| Hex | Tailwind | Purpose |
|-----|----------|---------|
| `#0F172A` | slate-950 | Primary text, headings |
| `#475569` | slate-600 | Secondary text |
| `#94A3B8` | slate-400 | Tertiary text, labels |
| `#E2E8F0` | slate-200 | Borders |
| `#F8FAFC` | slate-50 | Hover bg, subtle dividers |
| `#fff` | white | Cards, panels |
| `#2563EB` | blue-700 | Primary action |
| `#1D4ED8` | blue-800 | Button hover |
| `#EFF6FF` | blue-50 | Light backgrounds |
| `#16A34A` | green-600 | Completed status |
| `#DC2626` | red-600 | Cancelled status |
| `#EA580C` | orange-600 | No-show status |
