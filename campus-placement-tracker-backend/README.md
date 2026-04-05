# Campus Placement Tracker System — Milestone 3 Backend

Backend implementation for the Campus Placement Tracker System using:

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM

This project implements the required backend workflows for Milestone 3:

1. Student applies to a job with backend eligibility validation
2. Recruiter creates and manages job postings
3. Interview scheduling and slot booking with conflict detection

---

## Features

### 1. Authentication & Role-Based Access
- Student registration and login
- Recruiter registration and login
- JWT-based authentication
- Role-based protected routes for Students and Recruiters

### 2. Student Profile & Application Tracking
- Student academic profile stored in database
- Academic fields include:
  - CGPA
  - Program
  - Backlog Count
- My Applications endpoint for logged-in students
- Student can only apply using backend-stored academic data

### 3. Job Management
- Recruiter can Create, Read, Update, Delete jobs
- Jobs include:
  - title
  - description
  - eligibility criteria
  - application deadline
  - publish/unpublish state
- Public job listing endpoint
- Student eligible jobs endpoint

### 4. Backend Eligibility Validation
When a student applies:
- system checks minimum CGPA
- system checks allowed programs
- system checks max backlogs
- system checks application deadline
- system prevents duplicate applications

### 5. Interview Scheduling
- Recruiter creates interview slots
- Student books slots only after being shortlisted
- System prevents:
  - double-booking of the same slot
  - student interview time conflicts across companies
- Booking automatically updates application status

### 6. System Integrity
- Relational mapping:
  - Recruiters → Jobs
  - Students → Applications
  - Jobs → Applications
  - Jobs → Interview Slots
  - Applications → Interview Booking
- Database uniqueness constraints for application and booking safety
- Backend business logic enforced in service layer

---

## Folder Structure

```txt
campus-placement-tracker-backend/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.js
├─ src/
│  ├─ app.js
│  ├─ server.js
│  ├─ config/
│  │  └─ env.js
│  ├─ db/
│  │  └─ prisma.js
│  ├─ middlewares/
│  │  ├─ authMiddleware.js
│  │  ├─ roleMiddleware.js
│  │  ├─ errorMiddleware.js
│  │  └─ validateMiddleware.js
│  ├─ utils/
│  │  ├─ ApiError.js
│  │  ├─ apiResponse.js
│  │  ├─ catchAsync.js
│  │  ├─ jwt.js
│  │  └─ statusConstants.js
│  ├─ validators/
│  │  ├─ authValidators.js
│  │  ├─ jobValidators.js
│  │  ├─ applicationValidators.js
│  │  └─ slotValidators.js
│  ├─ services/
│  │  ├─ authService.js
│  │  ├─ jobService.js
│  │  ├─ applicationService.js
│  │  └─ interviewSlotService.js
│  ├─ controllers/
│  │  ├─ authController.js
│  │  ├─ studentController.js
│  │  ├─ recruiterController.js
│  │  ├─ jobController.js
│  │  ├─ applicationController.js
│  │  └─ interviewSlotController.js
│  └─ routes/
│     ├─ index.js
│     ├─ authRoutes.js
│     ├─ studentRoutes.js
│     ├─ recruiterRoutes.js
│     ├─ jobRoutes.js
│     ├─ applicationRoutes.js
│     └─ interviewSlotRoutes.js
├─ docs/
│  └─ api.md
├─ .env.example
├─ package.json
└─ README.md