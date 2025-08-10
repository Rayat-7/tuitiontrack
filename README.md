# About porject 
Project Overview:
Build a mobile-first SaaS web app called ***TuitionTrack* that helps individual tutors and coaching centers in Bangladesh manage their students, attendance, daily class logs, and fee tracking. The UI should be clean and friendly for Gen Z, inspired by Cal.com with subtle animations, modern fonts, and a minimal aesthetic.
🔧 Tech Stack:
* Frontend: Next.js + TypeScript + Tailwind CSS + ShadCN UI
* Auth: Clerk (for role-based login: Admin, Tutor)
* Database: Supabase (PostgreSQL)
* State Management: React Hooks, optional Zustand
* Deployment: Vercel
* Goal: Build in a modular way for future feature expansion.
🧩 User Roles:
1. Admin
   * Manages tutor accounts (Activate/Deactivate)
   * Handles bKash payment account mapping
   * Views all activity logs
2. Individual Tutor
   * Manages multiple tuition groups (1-on-1 or batches)
   * Tracks fees, attendance, and lesson logs
   * Adds notes, homework, and upcoming exam details
3. Coaching Center
   * Same features as tutor, but can have multiple staff (future scope)
   * Manages students in bulk
📱 UI Pages & Components:
1. Login & Onboarding
* Login/signup via Clerk
* Role selection: Individual Tutor or Coaching Center
* Onboarding: Create first tuition or import student list
2. Dashboard (Mobile-first)
* Summary Cards: Total Tuitions, Students, Unpaid Fees, Upcoming Class
* Floating Button to “Add Tuition”
3. Tuition List Page
* Cards for each tuition: Name, Student Count, Status
* Button to Add New Tuition
* Filter: Active / Archived
4. Inside a Tuition Page
* Tabs: Students | Calendar | Payments
* View student list with fee status
* Button to Add Student
* View/Edit Tuition Info
5. Calendar View (per tuition)
* Visual calendar with date highlights
* Tap a date to open full log:
   * What was taught
   * Who was present
   * Homework given
   * Next exam topic
   * Notes field
6. Student Fee Tracker
* Per-student fee history
* Editable field to input fees received
* Status: Paid / Due / Partial
* Optional: Export PDF report
7. Daily Class Log Page
* Date, Topics Covered, Notes
* Student Attendance toggles
* Homework given
* Button to mark “Exam Next Time” with topic
* Optional: Attach file/image
8. Admin Panel (Clerk Protected Route)
* Manage Tutor Accounts
* View Payments, Activity Logs
* Activate/Deactivate Tutor access
🎨 UI Style Guide:
* Font: Sans-serif (like Inter, Poppins)
* Colors: Soft violet/blue palette with white backgrounds
* Animations: Smooth transitions, hover/focus effects
* Mobile-First Design**: Use responsive layout with sticky headers & fab (floating action buttons) ihave used this theme in my code ---npx shadcn@latest add https://tweakcn.com/r/themes/violet-bloom.json
🔑 Key Features to Implement in MVP:
* Role-based login via Clerk
* Supabase schema: users, tuitions, students, attendance, logs, fees
* Mobile-first dashboard with summary
* Tuition + student CRUD
* Daily log with notes, attendance, homework
* Fee tracking per student
* Admin-only settings panel
* Clerk-protected routes
🧠 Extras (optional):
* bKash payment history view for future expansion
* Localized dates (Bangladesh time)
* Bengali language toggle (future phase)
* Email reminders for fee due (future phase)
you can see my current state of porject by going in to the git hub repo url : Rayat-7/tuitiontrack
✅ Output Expected:
* Modular Next.js app scaffold
* Working UI components with Tailwind and ShadCN
* Functional pages: Tuition CRUD, Fee Management, Calendar Log
* Supabase schema prewritten
* Clerk integration boilerplate
* Sample JSON/SQL seed data
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
