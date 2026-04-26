# Campus Placement Tracker Backend

Express + Prisma backend for the Campus Placement Tracker.

## Overview

This backend manages authentication, student profiles, recruiter profiles, jobs, applications, and interview scheduling. Business logic is split across controllers, routes, services, validators, middleware, and Prisma models.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT authentication
- bcrypt password hashing
- express-validator

## Run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Default API base URL: `http://localhost:5000/api`

## Main Scripts

- `npm run dev` - start with nodemon
- `npm start` - start with node
- `npm run prisma:generate` - generate Prisma Client
- `npm run prisma:migrate` - create/apply local migrations
- `npm run prisma:deploy` - apply migrations in deployed environments
- `npm run seed` - reset and seed demo data
- `npm run prisma:studio` - open Prisma Studio

## Architecture

```txt
src/
+-- controllers/   Request handlers
+-- services/      Business logic and database operations
+-- routes/        REST API route definitions
+-- validators/    Request validation rules
+-- middlewares/   Auth, role, validation, and error middleware
+-- utils/         Shared helpers and constants
+-- db/            Prisma client
```

See the root [README.md](../README.md) for complete setup and [docs/api.md](docs/api.md) for the full API reference.
