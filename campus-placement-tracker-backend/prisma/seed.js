import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/db/prisma.js";

const daysFromNow = (days, hour = 9, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

async function main() {
  await prisma.interviewBooking.deleteMany();
  await prisma.interviewSlot.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 10);

  const [student1, student2, student3] = await Promise.all([
    prisma.user.create({
      data: {
        fullName: "Ali Student",
        email: "student1@example.com",
        passwordHash,
        role: "STUDENT",
        studentProfile: {
          create: {
            rollNumber: "22F-001",
            cgpa: 3.45,
            program: "BSCS",
            backlogCount: 0,
            semester: 6
          }
        }
      },
      include: { studentProfile: true }
    }),
    prisma.user.create({
      data: {
        fullName: "Sara Student",
        email: "student2@example.com",
        passwordHash,
        role: "STUDENT",
        studentProfile: {
          create: {
            rollNumber: "22F-002",
            cgpa: 2.7,
            program: "BBA",
            backlogCount: 1,
            semester: 6
          }
        }
      },
      include: { studentProfile: true }
    }),
    prisma.user.create({
      data: {
        fullName: "Zain Merit",
        email: "student3@example.com",
        passwordHash,
        role: "STUDENT",
        studentProfile: {
          create: {
            rollNumber: "22F-003",
            cgpa: 3.82,
            program: "BSSE",
            backlogCount: 0,
            semester: 7
          }
        }
      },
      include: { studentProfile: true }
    })
  ]);

  const [techRecruiter, financeRecruiter] = await Promise.all([
    prisma.user.create({
      data: {
        fullName: "Ahmed Recruiter",
        email: "recruiter@example.com",
        passwordHash,
        role: "RECRUITER",
        recruiterProfile: {
          create: {
            companyName: "TechNova",
            companyEmail: "hr@technova.com",
            companyPhone: "+92-300-1234567"
          }
        }
      },
      include: { recruiterProfile: true }
    }),
    prisma.user.create({
      data: {
        fullName: "Nida Talent",
        email: "recruiter2@example.com",
        passwordHash,
        role: "RECRUITER",
        recruiterProfile: {
          create: {
            companyName: "FinEdge Labs",
            companyEmail: "careers@finedge.example",
            companyPhone: "+92-300-7654321"
          }
        }
      },
      include: { recruiterProfile: true }
    })
  ]);

  const [softwareJob, analystJob, embeddedJob] = await Promise.all([
    prisma.job.create({
      data: {
        recruiterId: techRecruiter.recruiterProfile.id,
        title: "Software Engineer Intern",
        description: "Backend internship for students comfortable with APIs, SQL, and clean service design.",
        location: "Lahore",
        jobType: "Internship",
        salaryPackage: "50,000 PKR/month",
        minCgpa: 3.0,
        maxBacklogs: 0,
        allowedPrograms: ["BSCS", "BSSE", "BSIT"],
        applicationDeadline: daysFromNow(21, 23, 59),
        isPublished: true
      }
    }),
    prisma.job.create({
      data: {
        recruiterId: financeRecruiter.recruiterProfile.id,
        title: "Data Analyst Trainee",
        description: "Analytics trainee role focused on dashboards, SQL, and placement data insights.",
        location: "Karachi",
        jobType: "Full Time",
        salaryPackage: "90,000 PKR/month",
        minCgpa: 2.5,
        maxBacklogs: 1,
        allowedPrograms: ["BBA", "BSCS", "BSSE"],
        applicationDeadline: daysFromNow(14, 23, 59),
        isPublished: true
      }
    }),
    prisma.job.create({
      data: {
        recruiterId: techRecruiter.recruiterProfile.id,
        title: "Embedded Systems Associate",
        description: "Entry-level role for high-CGPA software engineering students interested in IoT devices.",
        location: "Islamabad",
        jobType: "Full Time",
        salaryPackage: "120,000 PKR/month",
        minCgpa: 3.6,
        maxBacklogs: 0,
        allowedPrograms: ["BSSE"],
        applicationDeadline: daysFromNow(18, 23, 59),
        isPublished: true
      }
    })
  ]);

  await Promise.all([
    prisma.job.create({
      data: {
        recruiterId: techRecruiter.recruiterProfile.id,
        title: "Closed QA Internship",
        description: "Expired posting used to verify server-side deadline validation.",
        location: "Remote",
        jobType: "Internship",
        salaryPackage: "40,000 PKR/month",
        minCgpa: 2.8,
        maxBacklogs: 1,
        allowedPrograms: ["BSCS", "BSSE"],
        applicationDeadline: daysFromNow(-2, 23, 59),
        isPublished: true
      }
    }),
    prisma.job.create({
      data: {
        recruiterId: financeRecruiter.recruiterProfile.id,
        title: "Draft Business Analyst",
        description: "Unpublished recruiter draft that should not appear in student listings.",
        location: "Lahore",
        jobType: "Full Time",
        salaryPackage: "85,000 PKR/month",
        minCgpa: 2.6,
        maxBacklogs: 1,
        allowedPrograms: ["BBA"],
        applicationDeadline: daysFromNow(30, 23, 59),
        isPublished: false
      }
    })
  ]);

  const [aliApplication, zainApplication, saraApplication] = await Promise.all([
    prisma.application.create({
      data: {
        studentId: student1.studentProfile.id,
        jobId: softwareJob.id,
        status: "APPLIED"
      }
    }),
    prisma.application.create({
      data: {
        studentId: student3.studentProfile.id,
        jobId: softwareJob.id,
        status: "SHORTLISTED"
      }
    }),
    prisma.application.create({
      data: {
        studentId: student2.studentProfile.id,
        jobId: analystJob.id,
        status: "INTERVIEW_SCHEDULED"
      }
    })
  ]);

  const [softwareMorningSlot, softwareLateSlot, analystBookedSlot] = await Promise.all([
    prisma.interviewSlot.create({
      data: {
        jobId: softwareJob.id,
        date: daysFromNow(4, 0, 0),
        startTime: daysFromNow(4, 10, 0),
        endTime: daysFromNow(4, 10, 30),
        status: "AVAILABLE"
      }
    }),
    prisma.interviewSlot.create({
      data: {
        jobId: softwareJob.id,
        date: daysFromNow(4, 0, 0),
        startTime: daysFromNow(4, 11, 0),
        endTime: daysFromNow(4, 11, 30),
        status: "AVAILABLE"
      }
    }),
    prisma.interviewSlot.create({
      data: {
        jobId: analystJob.id,
        date: daysFromNow(4, 0, 0),
        startTime: daysFromNow(4, 10, 15),
        endTime: daysFromNow(4, 10, 45),
        status: "BOOKED"
      }
    })
  ]);

  await prisma.interviewSlot.create({
    data: {
      jobId: embeddedJob.id,
      date: daysFromNow(6, 0, 0),
      startTime: daysFromNow(6, 14, 0),
      endTime: daysFromNow(6, 14, 30),
      status: "AVAILABLE"
    }
  });

  await prisma.interviewBooking.create({
    data: {
      applicationId: saraApplication.id,
      slotId: analystBookedSlot.id
    }
  });

  console.log("Seed data inserted successfully.");
  console.log({
    students: [
      "student1@example.com / 123456",
      "student2@example.com / 123456",
      "student3@example.com / 123456"
    ],
    recruiters: [
      "recruiter@example.com / 123456",
      "recruiter2@example.com / 123456"
    ],
    seededApplications: {
      ali: `Application ${aliApplication.id} is APPLIED for duplicate and shortlist testing.`,
      zain: `Application ${zainApplication.id} is SHORTLISTED and can book slot ${softwareMorningSlot.id}.`,
      sara: `Application ${saraApplication.id} already has a booked interview.`
    },
    availableSlotIds: [softwareMorningSlot.id, softwareLateSlot.id]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
