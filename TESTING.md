# Authentication & CRUD Flow Testing Guide

## Route Structure
- **Patient Routes**: /appointments, /appointments/book, /prescriptions, /profile
- **Doctor Routes**: /doctor/patients, /doctor/patients/[id], /doctor/my-prescriptions, /doctor/schedule
- **Admin Routes**: /admin/users, /admin/appointments, /admin/schedule
- **Shared**: /dashboard (role-based content), /login, /signup

## Prerequisite Setup
1. Ensure PostgreSQL is running with the healthcare_portal database
2. Run: `npm run dev` to start the development server
3. Navigate to http://localhost:3000

## Test Cases

### Test 1: Patient Signup and Login
**Steps:**
1. Navigate to http://localhost:3000
2. Click on "Sign Up" (or go to /signup)
3. Fill in:
   - Name: "John Patient"
   - Email: "patient@example.com"
   - Password: "password123"
   - Role: Patient
   - Click "Sign Up"
4. Should redirect to Dashboard after successful signup
5. Sign out and login again with same credentials to verify persistence

**Expected Results:**
- User account created in database
- Session established with role "patient"
- Dashboard shows patient-specific content (upcoming appointments, prescriptions)
- Navigation shows patient-only links

---

### Test 2: Doctor Signup with Specialty
**Steps:**
1. Navigate to /signup
2. Fill in:
   - Name: "Dr. Sarah Smith"
   - Email: "doctor@example.com"
   - Password: "password123"
   - Role: Doctor
   - Specialty: "Cardiology"
   - Click "Sign Up"
3. Should redirect to Dashboard after successful signup

**Expected Results:**
- Doctor account created with specialty "Cardiology"
- Dashboard shows doctor-specific content (today's appointments, patients)
- Navigation shows doctor-only links (Patients, Prescriptions, Schedule)

---

### Test 3: Admin Signup
**Steps:**
1. Navigate to /signup
2. Fill in:
   - Name: "Admin User"
   - Email: "admin@example.com"
   - Password: "password123"
   - Role: Admin
   - Click "Sign Up"

**Expected Results:**
- Admin account created in database
- Dashboard shows admin-specific content (KPI cards, staff management)
- Navigation shows admin-only links (Users, Appointments, Schedule)

---

### Test 4: Patient Books Appointment with Doctor
**Steps:**
1. Login as patient (John Patient)
2. Click "Book Appointment" in navigation or navigate to /appointments/book
3. Fill in:
   - Select Doctor: "Dr. Sarah Smith"
   - Preferred Date & Time: Tomorrow, 2:00 PM
   - Reason for Visit: "Chest pain evaluation"
   - Click "Book Appointment"
4. Should redirect to /appointments page
5. Verify appointment appears in the list

**Expected Results:**
- Appointment created in database with status "scheduled"
- Patient sees appointment in their appointments list
- Doctor sees appointment in their "Today's Appointments" (if today)
- Admin can view in admin appointments page

---

### Test 5: Doctor Creates Prescription for Patient
**Steps:**
1. Login as doctor (Dr. Sarah Smith)
2. Navigate to /patients
3. Click "View Full Record" on patient "John Patient"
4. Scroll to "Create Prescription" section
5. Fill in:
   - Medication: "Aspirin"
   - Dosage: "100mg"
   - Frequency: "1x daily"
   - Start Date: Today
   - Click "Create Prescription"
6. Prescription should appear in the list above

**Expected Results:**
- Prescription created with status "active"
- Patient sees prescription in their /prescriptions page
- Doctor sees prescription in their /prescriptions page
- Prescription marked as active (3 refills remaining default)

---

### Test 6: Admin Creates Staff Shift
**Steps:**
1. Login as admin (Admin User)
2. Navigate to /admin/schedule
3. Fill in the "Create Shift" form:
   - Doctor: "Dr. Sarah Smith"
   - Date: Next week (any date)
   - Start Time: 09:00
   - End Time: 17:00
   - Notes: "Regular shift"
   - Click "Create Shift"
4. Shift should appear in "Upcoming Shifts" list

**Expected Results:**
- Shift created in database
- Doctor can see their shift in /schedule
- Admin can see shift in /admin/schedule

---

### Test 7: Role-Based Access Control (RBAC)
**Steps (Patient):**
1. Login as patient
2. Try to access:
   - /dashboard ✓ (allowed)
   - /appointments ✓ (allowed)
   - /profile ✓ (allowed)
   - /doctor/patients (should redirect to /dashboard)
   - /admin/users (should redirect to /dashboard)

**Steps (Doctor):**
1. Login as doctor
2. Try to access:
   - /dashboard ✓ (allowed)
   - /doctor/patients ✓ (allowed)
   - /doctor/my-prescriptions ✓ (allowed)
   - /doctor/schedule ✓ (allowed)
   - /admin/users (should redirect to /dashboard)
   - /appointments/book (should redirect to /dashboard)

**Steps (Admin):**
1. Login as admin
2. Try to access:
   - /dashboard ✓ (allowed)
   - /admin/users ✓ (allowed)
   - /admin/appointments ✓ (allowed)
   - /admin/schedule ✓ (allowed)
   - /appointments/book (should redirect to /dashboard)

**Expected Results:**
- Unauthorized role access is blocked with redirect to /dashboard
- Navigation only shows appropriate links for each role
- API endpoints return 403 Forbidden for unauthorized requests

---

### Test 8: Patient Profile Update and Picture Upload
**Steps:**
1. Login as patient
2. Navigate to /profile
3. Fill in medical information:
   - Date of Birth: 1990-05-15
   - Gender: Male
   - Blood Type: O+
   - Allergies: Penicillin
   - Medical History: Hypertension
   - Click "Save Changes"
4. Upload profile picture:
   - Click "Choose Profile Picture"
   - Select an image file
   - Click "Upload Picture"
5. Verify profile picture appears and data is saved

**Expected Results:**
- Profile data persists in database
- Profile picture uploads to Vercel Blob
- Picture URL saved to patient record
- Picture appears on profile page

---

## Sign-Out Testing
**Steps:**
1. Login as any user
2. Click "Sign Out" in navigation bar
3. Should redirect to /login
4. Attempting to access authenticated routes should redirect to /login

**Expected Results:**
- Session terminated
- User logged out successfully
- Protected pages redirect to login

---

## Notes
- All test credentials should be unique (use different emails)
- Database must be seeded with schema before testing
- Vercel Blob token in .env.local can be a placeholder for local testing
- Test with different browsers/incognito windows to verify session isolation
