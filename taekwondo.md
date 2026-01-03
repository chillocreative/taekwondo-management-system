# Taekwondo Management System (TMS) - System Summary

## Overview
The Taekwondo Management System (TMS) is a comprehensive web application designed to manage a Taekwondo academy's daily operations. It facilitates the management of students, attendance, fee payments (both online and offline), and communication between the academy and parents.

**Tech Stack:**
- **Backend:** Laravel 11.x (PHP 8.2+)
- **Frontend:** React with Inertia.js
- **Database:** MySQL
- **Styling:** Tailwind CSS
- **Authentication:** Laravel Breeze
- **PDF Generation:** DomPDF

---

## User Roles

### 1. **Admin**
- **Dashboard:** Overview of pending payments, attendance stats, and quick actions.
- **User Management:** Create, edit, delete users (Admins, Coaches, Parents).
- **Student Management:** Manage student enrollment, belt levels, and profiles.
- **Financial Management:** 
    - Verify and approve offline payments (bank transfers/cash).
    - Monitor monthly fee payments.
    - Configure fee structures.
- **Attendance Monitoring:** View overall attendance heatmap and reports.
- **Notifications:** Receive alerts for new registrations and payments.

### 2. **Parent (Pengguna)**
- **Dashboard:** Personalized view with their children's stats.
- **Child Management:** Add and manage profiles for their children ("Nama Peserta").
- **Attendance:** View detailed attendance history and heatmap for their children.
- **Fee Payment:** 
    - View monthly fee status (Paid, Unpaid, Overdue).
    - Pay fees via Online Payment (ToyyibPay integration - *Ready*) or Offline Payment (Upload receipt).
    - Download and view payment receipts.

### 3. **Coach (Jurulatih)**
- **Attendance:** Take attendance for classes (Scan QR or Manual Check-in).
- **Student Progress:** Monitor basic student info.

---

## Key Modules & Features

### 📅 Attendance System
- **Heatmap Visualization:** Parents admin can view a year-long heatmap of attendance (similar to GitHub contributions).
- **Monthly Reports:** Detailed list of attendance with status (Hadir, Sakit, Cuti).
- **Admin Monitoring:** Admins have a dedicated view to specific student attendance records.

### 💰 Fee & Payment System
- **Monthly Fees:** 
    - Automated generation of monthly fee records.
    - Fees are due on the **last day of the month**.
    - **Status Tracking:** "Sudah Dibayar" (Green), "Belum Dibayar" (Amber), "Tertunggak" (Red/Overdue).
- **Online Payment:** Integrated with **ToyyibPay** for instant banking handling.
- **Offline Payment:** 
    - Parents can upload proof of payment (images/PDF).
    - Admins review and approve/reject these payments.
    - Offline payments flow: Upload Receipt -> "Sedang Semak" -> Admin Approval -> "Sudah Dibayar".
- **Dynamic Fee Structure:** Fees are calculated based on student age (Under 18 / Adult) as configured in Settings.

### 🔔 Notification System
- **Real-time Alerts:** Admin receives notifications for:
    - New User Registrations (Blue).
    - Payment Approvals (Green).
- **Bell Icon:** Located in the top header (Admin only).
- **Features:** Auto-refresh (30s polling), "Mark All as Read", and unread count badge.

### 👥 User & Student Management
- **Profile Management:** Users can update their profile and address.
- **Student Profiles:** Tracks belt level, training center, and active status.
- **Role-Based Access:** Strict policy gates ensure users only see their own data.

---

## Database Structure Highlights
- **Users:** Authentication and profile info.
- **Children:** Student profiles linked to Parents (Users).
- **Attendance:** Records specific dates and statuses for each child.
- **MonthlyPayments:** Tracks fee status per month per child.
- **Notifications:** Stores system alerts.
- **FeeSettings:** Configurable global fee values.

## Deployment & Production
- **Environment:** cPanel / Linux Hosting.
- **Build Process:** Vite for frontend assets (`npm run build`).
- **Database:** MySQL with migrations for schema management.
- **Timezone:** Asia/Kuala_Lumpur (GMT+8).

---
*Generated on: 2026-01-04*
