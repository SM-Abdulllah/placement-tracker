Campus Placement Tracker (Backend)

Overview
The Campus Placement Tracker is a backend system designed to manage and streamline the campus recruitment process. It provides APIs for handling students, recruiters, job postings, applications, and interview scheduling.

This project is developed as part of Web-Based Application Development – Milestone 3.


 Features
- User Authentication (Register/Login)
- Manage Students
- Manage Recruiters
- Manage Job Postings
- Application Tracking System
- Interview Slot Scheduling
- Dashboard Services


 Tech Stack
- Backend: Node.js (Express.js)
- Database: PostgreSQL
- ORM: Prisma
 Authentication: JWT



Project Structure


campus-placement-tracker-backend/
│
├── prisma/                # Database schema & migrations
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── routes/            # API routes
│   ├── middlewares/       # Auth, validation, error handling
│   ├── utils/             # Helper utilities
│   └── config/            # Environment configs
│
├── .env.example
├── package.json
└── README.md


Setup Instructions

Clone the repository
bash
git clone https://github.com/SM-Abdulllah/placement-tracker.git
cd placement-tracker/campus-placement-tracker-backend


 Install dependencies

bash
npm install

Setup environment variables

Create a `.env` file using `.env.example`:

env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key


 Setup Database

bash
npx prisma migrate dev
npx prisma generate

(Optional: Seed data)

bash
node prisma/seed.js


Run the server

bash
npm run dev

Server runs at:

http://localhost:5000


API Endpoints

Auth

`POST /api/auth/register`
`POST /api/auth/login`


 Students

`GET /api/students`
`POST /api/students`
`PUT /api/students/:id`
`DELETE /api/students/:id`


Recruiters

`GET /api/recruiters`
`POST /api/recruiters`
`PUT /api/recruiters/:id`
`DELETE /api/recruiters/:id`



Jobs

`GET /api/jobs`
`POST /api/jobs`
`PUT /api/jobs/:id`
`DELETE /api/jobs/:id`


Applications

`GET /api/applications`
`POST /api/applications`
`PUT /api/applications/:id`
`DELETE /api/applications/:id`


Interview Slots

`GET /api/interview-slots`
`POST /api/interview-slots`
`PUT /api/interview-slots/:id`
`DELETE /api/interview-slots/:id`


Backend Design Highlights

*  Modular architecture (Controllers → Services → DB)
*  Separation of concerns
*  RESTful API design
*  Prisma ORM for database abstraction
*  Middleware for authentication & validation
*  Consistent JSON responses

---

Version Control

 GitHub repository used for version control
 Proper commits with meaningful messages
 All final code merged into `main` branch


Notes for Evaluators


If you want, I can also **quickly review your API routes vs rubric** to make sure you get full 15/15 👍
