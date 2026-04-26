# Campus Placement Tracker

Campus Placement Tracker is a full-stack placement workflow system for students and recruiters. The backend enforces all eligibility and scheduling rules with Express, PostgreSQL, and Prisma. The frontend is a Vite + React app with protected student and recruiter workspaces.

Repository: [SM-Abdulllah/placement-tracker](https://github.com/SM-Abdulllah/placement-tracker)

## Features and Workflows

- Student and recruiter registration, login, logout, JWT authentication, and role-protected routes.
- Student profile stores roll number, semester, program/major, CGPA, and backlog count.
- Students see eligible jobs, view job details, apply, withdraw eligible applications, track status, and book interview slots after shortlisting.
- Recruiters create, view, update, delete, publish, and unpublish jobs with eligibility criteria and deadlines.
- Recruiters view applications for their jobs and update statuses through the placement workflow.
- Recruiters create, update, cancel, and delete interview slots for their own jobs.
- Backend application validation checks CGPA, allowed programs, backlog count, deadline using server time, duplicate applications, and published job state.
- Backend booking validation prevents unavailable slots, past slots, wrong job/application pairing, non-shortlisted bookings, duplicate bookings, race conflicts, and overlapping interviews.

## Tech Stack

- Frontend: Vite, React, React Router, Lucide React, CSS
- Backend: Node.js, Express, Prisma ORM
- Database: PostgreSQL
- Auth: JWT, bcrypt
- Validation: express-validator plus service-layer business rules

## Folder Structure

```txt
.
+-- campus-placement-tracker-backend/
|   +-- prisma/
|   |   +-- migrations/
|   |   +-- schema.prisma
|   |   +-- seed.js
|   +-- src/
|   |   +-- config/
|   |   +-- controllers/
|   |   +-- db/
|   |   +-- middlewares/
|   |   +-- routes/
|   |   +-- services/
|   |   +-- utils/
|   |   +-- validators/
|   +-- docs/api.md
|   +-- package.json
+-- campus-placement-tracker-frontend/
|   +-- src/
|   |   +-- api/
|   |   +-- components/
|   |   +-- context/
|   |   +-- pages/
|   |   +-- utils/
|   +-- package.json
+-- README.md
```

## Environment Variables

Backend: create `campus-placement-tracker-backend/.env` from `.env.example`.

```env
PORT=5000
DATABASE_URL="postgresql://postgres:1234@localhost:5432/campus_tracker?schema=public"
JWT_SECRET="super_secret_change_me"
JWT_EXPIRES_IN="7d"
NODE_ENV=development
```

Frontend: create `campus-placement-tracker-frontend/.env` from `.env.example`.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## PostgreSQL Setup

1. Install and start PostgreSQL.
2. Create a database named `campus_tracker`.
3. Confirm `DATABASE_URL` in the backend `.env` matches your local user, password, host, port, and database name.

Example:

```bash
createdb campus_tracker
```

## Backend Setup

```bash
cd campus-placement-tracker-backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Backend URL: `http://localhost:5000/api`

## Frontend Setup

```bash
cd campus-placement-tracker-frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Prisma Commands

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run seed
npm run prisma:studio
```

## API Route Summary

All successful responses use:

```json
{
  "success": true,
  "message": "Operation message.",
  "data": {}
}
```

Key routes:

- `GET /api/health`
- `POST /api/auth/register/student`
- `POST /api/auth/register/recruiter`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/students/me`
- `GET /api/students/jobs/available`
- `GET /api/students/me/applications`
- `POST /api/applications`
- `DELETE /api/students/me/applications/:id`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/recruiters/me`
- `GET /api/recruiters/jobs`
- `POST /api/recruiters/jobs`
- `GET /api/recruiters/jobs/:id`
- `PUT /api/recruiters/jobs/:id`
- `DELETE /api/recruiters/jobs/:id`
- `GET /api/applications/recruiter/all`
- `GET /api/applications/recruiter/job/:jobId`
- `PUT /api/applications/:id/status`
- `GET /api/slots/job/:jobId`
- `POST /api/slots`
- `PUT /api/slots/:id`
- `DELETE /api/slots/:id`
- `POST /api/slots/:id/book`

Full endpoint documentation is in [campus-placement-tracker-backend/docs/api.md](campus-placement-tracker-backend/docs/api.md).

## Seed Test Credentials

All seeded users use password `123456`.

Students:

- `student1@example.com`
- `student2@example.com`
- `student3@example.com`

Recruiters:

- `recruiter@example.com`
- `recruiter2@example.com`

Seed data includes published jobs, an expired job, an unpublished draft, APPLIED and SHORTLISTED applications, available interview slots, and one booked interview.

## Team Contributions

- Backend workflow implementation: authentication, role authorization, Prisma schema, jobs, applications, eligibility checks, interview slots, and booking safety.
- Frontend implementation: React routing, protected dashboards, student workflows, recruiter workflows, forms, validation, alerts, and responsive UI.
- Documentation and setup: README, API reference, environment examples, seed credentials, and run commands.

## Quality Checklist

- Backend eligibility is enforced on the server.
- Student academic data is read-only during application.
- Application uniqueness is enforced by `studentId + jobId`.
- Slot booking uniqueness is enforced by `slotId` and `applicationId`.
- Slot booking uses a Prisma transaction and atomic availability update.
- Student interview overlaps are checked across all companies.
- React forms call real backend APIs and display backend validation errors.
