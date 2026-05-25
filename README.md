# Aptech Student Tracker

A premium, secure web application designed for Center Academic Heads (CAH) to track and manage student academic records, projects, exams, top-up university options, and sponsor details.

## 🚀 Features

- **🔑 Secure Session Authentication**: Cookie-based login with cryptographic signature verification (HMAC-SHA256) to prevent session tampering.
- **🛡️ Role-Based Access Controls**:
  - **Center Academic Head (CAH)**: Full read, write, edit, and deletion privileges.
  - **Staff Members**: Authorized to view and update student records, but restricted from deleting data.
- **📝 Exam & Project Tracking**: Complete CRUD (Create, Read, Update, Delete) capability on individual exams and semester projects.
- **📅 Update History (Audit Trail)**: Dynamic transactional logs tracking every student profile change, capturing _what_ was modified, _when_, and _who_ did it.
- **📤 Export & PDF Print Reports**: One-click dashboard data exports to CSV, and highly styled `@media print` layout formatting for printing student registrations as official paper sheets.
- **⚡ Premium UX/UI**: Mobile-responsive layout, Next.js streaming skeletons, and glassmorphic micro-animations.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Prisma
- **UI Components**: Base UI (`@base-ui/react`) & Tailwind CSS v4
- **Form Validation**: React Hook Form + Zod

---

## ⚙️ Local Setup

1. **Clone the Repository** and navigate to the project directory.

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="your-postgresql-connection-string"
   SESSION_SECRET="your-32-character-random-secret"
   ```

4. **Initialize Database Schema & Generate Prisma Client**:

   ```bash
   npx prisma db push
   ```

5. **Seed the CAH Admin User**:
   Ensure your `.env` file includes `ADMIN_EMAIL` and `ADMIN_PASSWORD` (see Environment Variables above), then run:

   ```bash
   node prisma/seed.js
   ```

   This will create the CAH admin account using the credentials from your environment.

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to log in.

---

## 🔒 Production Security Checklist

- **Secrets Management**: Never commit your `.env` file. Ensure `DATABASE_URL` and `SESSION_SECRET` are supplied as environment variables on your deployment platform (e.g., Vercel, Netlify, Render).
- **Session Protection**: The session signature uses HMAC-SHA256. In production, the session cookie is automatically marked `Secure`, requiring HTTPS connection.
- **Console Logs Cleaned**: All testing/debugging console logs have been removed to keep client and server production logs clean.
