import bcrypt from "bcrypt";
import prisma from "../src/db/prisma.js";

async function main() {
  await prisma.interviewBooking.deleteMany();
  await prisma.interviewSlot.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 10);

  const student1 = await prisma.user.create({
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
    }
  });

  const student2 = await prisma.user.create({
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
    }
  });

  const recruiter = await prisma.user.create({
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
    include: {
      recruiterProfile: true
    }
  });

  await prisma.job.create({
    data: {
      recruiterId: recruiter.recruiterProfile.id,
      title: "Software Engineer Intern",
      description: "Backend internship for final year students.",
      location: "Lahore",
      jobType: "Internship",
      salaryPackage: "50,000 PKR/month",
      minCgpa: 3.0,
      maxBacklogs: 0,
      allowedPrograms: ["BSCS", "BSSE", "BSIT"],
      applicationDeadline: new Date("2026-05-01T23:59:59.000Z"),
      isPublished: true
    }
  });

  console.log("Seed data inserted successfully.");
  console.log({
    student1: "student1@example.com / 123456",
    student2: "student2@example.com / 123456",
    recruiter: "recruiter@example.com / 123456"
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