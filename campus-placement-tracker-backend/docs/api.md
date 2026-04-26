# Campus Placement Tracker API

Base URL: `http://localhost:5000/api`

Protected routes require:

```http
Authorization: Bearer <jwt>
```

Successful response envelope:

```json
{
  "success": true,
  "message": "Message.",
  "data": {}
}
```

Error response envelope:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "type": "field",
      "msg": "Valid email is required.",
      "path": "email",
      "location": "body"
    }
  ]
}
```

## Health

### GET `/health`

Auth: Public

Response:

```json
{
  "success": true,
  "message": "Campus Placement Tracker backend is running"
}
```

## Authentication

### POST `/auth/register/student`

Auth: Public

Body:

```json
{
  "fullName": "Ali Student",
  "email": "ali@example.com",
  "password": "123456",
  "rollNumber": "22F-101",
  "cgpa": 3.4,
  "program": "BSCS",
  "backlogCount": 0,
  "semester": 6
}
```

Response:

```json
{
  "success": true,
  "message": "Student registered successfully.",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "fullName": "Ali Student",
      "email": "ali@example.com",
      "role": "STUDENT",
      "studentProfile": {
        "id": 1,
        "rollNumber": "22F-101",
        "cgpa": 3.4,
        "program": "BSCS",
        "backlogCount": 0,
        "semester": 6
      },
      "recruiterProfile": null
    }
  }
}
```

### POST `/auth/register/recruiter`

Auth: Public

Body:

```json
{
  "fullName": "Ahmed Recruiter",
  "email": "recruiter@example.com",
  "password": "123456",
  "companyName": "TechNova",
  "companyEmail": "hr@technova.com",
  "companyPhone": "+92-300-1234567"
}
```

Response includes `token` and `user.role = "RECRUITER"`.

### POST `/auth/login`

Auth: Public

Body:

```json
{
  "email": "student1@example.com",
  "password": "123456"
}
```

Response includes `token` and the current user profile.

### GET `/auth/me`

Auth: Student or Recruiter

Response:

```json
{
  "success": true,
  "message": "Current user profile fetched successfully.",
  "data": {
    "id": 1,
    "fullName": "Ali Student",
    "email": "student1@example.com",
    "role": "STUDENT",
    "studentProfile": {},
    "recruiterProfile": null
  }
}
```

### POST `/auth/logout`

Auth: Student or Recruiter

Response:

```json
{
  "success": true,
  "message": "Logout successful. Please remove the token on the client.",
  "data": null
}
```

## Students

### GET `/students/me`

Auth: Student

Returns the logged-in student profile with read-only academic fields.

### GET `/students/jobs/available`

Auth: Student

Returns published jobs the student can currently apply to. The backend filters by server-side deadline, CGPA, program, backlog count, and duplicate application state.

Response:

```json
{
  "success": true,
  "message": "Eligible jobs fetched successfully for student.",
  "data": [
    {
      "id": 1,
      "title": "Software Engineer Intern",
      "description": "Backend internship.",
      "location": "Lahore",
      "jobType": "Internship",
      "salaryPackage": "50,000 PKR/month",
      "minCgpa": 3,
      "maxBacklogs": 0,
      "allowedPrograms": ["BSCS", "BSSE", "BSIT"],
      "applicationDeadline": "2026-05-17T18:59:00.000Z",
      "isPublished": true,
      "recruiter": {
        "id": 1,
        "companyName": "TechNova"
      }
    }
  ]
}
```

### GET `/students/me/applications`

Auth: Student

Returns applications owned by the logged-in student.

### GET `/students/me/applications/:id`

Auth: Student

Returns one application owned by the logged-in student.

### DELETE `/students/me/applications/:id`

Auth: Student

Withdraws an application only when its status is `APPLIED` or `REJECTED`.

## Jobs

### GET `/jobs`

Auth: Public

Returns published, non-expired jobs.

### GET `/jobs/:id`

Auth: Public

Returns a published job by ID.

### GET `/jobs/student/available/list`

Auth: Student

Alias for eligible student jobs.

### GET `/jobs/recruiter/my-jobs`

Auth: Recruiter

Alias for the recruiter's own jobs.

### POST `/jobs/recruiter`

Auth: Recruiter

Alias for creating a recruiter job.

### GET `/jobs/recruiter/:id`

Auth: Recruiter

Alias for viewing one owned recruiter job.

### PUT `/jobs/recruiter/:id`

Auth: Recruiter

Alias for updating one owned recruiter job.

### DELETE `/jobs/recruiter/:id`

Auth: Recruiter

Alias for deleting one owned recruiter job.

## Recruiters

### GET `/recruiters/me`

Auth: Recruiter

Returns the logged-in recruiter profile.

### GET `/recruiters/jobs`

Auth: Recruiter

Returns jobs owned by the logged-in recruiter.

### POST `/recruiters/jobs`

Auth: Recruiter

Body:

```json
{
  "title": "Software Engineer Intern",
  "description": "Backend internship for final year students.",
  "location": "Lahore",
  "jobType": "Internship",
  "salaryPackage": "50,000 PKR/month",
  "minCgpa": 3,
  "maxBacklogs": 0,
  "allowedPrograms": ["BSCS", "BSSE", "BSIT"],
  "applicationDeadline": "2026-05-17T18:59:00.000Z",
  "isPublished": true
}
```

Response returns the created job. Deadline must be in the future.

### GET `/recruiters/jobs/:id`

Auth: Recruiter

Returns one owned job.

### PUT `/recruiters/jobs/:id`

Auth: Recruiter

Body: any editable job fields from `POST /recruiters/jobs`.

Response returns the updated job.

### DELETE `/recruiters/jobs/:id`

Auth: Recruiter

Deletes an owned job. Related applications, slots, and bookings are removed by database cascade rules.

## Applications

### POST `/applications`

Auth: Student

Body:

```json
{
  "jobId": 1
}
```

Server validations:

- Job exists and is published.
- Deadline has not passed using server time.
- Student CGPA is at least `job.minCgpa`.
- Student backlog count is at most `job.maxBacklogs`.
- Student program is included in `job.allowedPrograms`.
- Student has not already applied to the job.

Response:

```json
{
  "success": true,
  "message": "Application submitted successfully.",
  "data": {
    "id": 1,
    "studentId": 1,
    "jobId": 1,
    "status": "APPLIED",
    "appliedAt": "2026-04-26T14:00:00.000Z"
  }
}
```

### GET `/applications/my`

Auth: Student

Alias for the logged-in student's applications.

### GET `/applications/my/:id`

Auth: Student

Alias for one logged-in student application.

### DELETE `/applications/my/:id`

Auth: Student

Alias for withdrawing a student application.

### GET `/applications/recruiter/all`

Auth: Recruiter

Returns all applications for jobs owned by the logged-in recruiter.

### GET `/applications/recruiter/job/:jobId`

Auth: Recruiter

Returns applications for one owned recruiter job.

### PUT `/applications/:id/status`

Auth: Recruiter

Body:

```json
{
  "status": "SHORTLISTED"
}
```

Allowed statuses:

- `APPLIED`
- `SHORTLISTED`
- `REJECTED`
- `INTERVIEW_SCHEDULED`
- `INTERVIEW_COMPLETED`
- `OFFERED`
- `HIRED`

Workflow protection:

- `APPLIED` -> `SHORTLISTED`, `REJECTED`
- `SHORTLISTED` -> `INTERVIEW_SCHEDULED`, `REJECTED`
- `INTERVIEW_SCHEDULED` -> `INTERVIEW_COMPLETED`, `REJECTED`
- `INTERVIEW_COMPLETED` -> `OFFERED`, `REJECTED`
- `OFFERED` -> `HIRED`, `REJECTED`
- `REJECTED` and `HIRED` are terminal
- `INTERVIEW_SCHEDULED` requires an interview booking

## Interview Slots

### GET `/slots/job/:jobId`

Auth: Student or Recruiter

Query:

- `available=true` returns future available slots only.

Access rules:

- Recruiters can view slots for jobs they own.
- Students can view future available slots only when they have a `SHORTLISTED` application for that job.

### POST `/slots`

Auth: Recruiter

Body:

```json
{
  "jobId": 1,
  "date": "2026-05-03T00:00:00.000Z",
  "startTime": "2026-05-03T10:00:00.000Z",
  "endTime": "2026-05-03T10:30:00.000Z"
}
```

Response returns the created slot with `status = "AVAILABLE"`.

### PUT `/slots/:id`

Auth: Recruiter

Body:

```json
{
  "date": "2026-05-03T00:00:00.000Z",
  "startTime": "2026-05-03T11:00:00.000Z",
  "endTime": "2026-05-03T11:30:00.000Z",
  "status": "CANCELLED"
}
```

Booked slots cannot be edited. Unbooked slots cannot be manually marked `BOOKED`.

### DELETE `/slots/:id`

Auth: Recruiter

Deletes an owned unbooked slot.

### POST `/slots/:id/book`

Auth: Student

Body:

```json
{
  "applicationId": 2
}
```

Server validations:

- Slot exists.
- Slot is `AVAILABLE`.
- Slot start time is in the future.
- Application belongs to the logged-in student.
- Application job matches slot job.
- Application status is `SHORTLISTED`.
- Application does not already have a booking.
- Slot does not already have a booking.
- Student has no overlapping interview booking at any company.

The transaction atomically marks the slot `BOOKED`, creates `InterviewBooking`, and updates application status to `INTERVIEW_SCHEDULED`.

Response:

```json
{
  "success": true,
  "message": "Interview slot booked successfully.",
  "data": {
    "id": 1,
    "applicationId": 2,
    "slotId": 1,
    "bookedAt": "2026-04-26T14:10:00.000Z",
    "slot": {
      "id": 1,
      "status": "BOOKED",
      "startTime": "2026-05-03T10:00:00.000Z",
      "endTime": "2026-05-03T10:30:00.000Z"
    }
  }
}
```
