import prisma from "../db/prisma.js";
import ApiError from "../utils/ApiError.js";
import { APPLICATION_STATUS } from "../utils/statusConstants.js";

const applicationInclude = {
  student: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  },
  job: {
    include: {
      recruiter: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  },
  booking: {
    include: {
      slot: true
    }
  }
};

const getStudentProfileByUserId = async (userId) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId }
  });

  if (!student) {
    throw new ApiError(404, "Student profile not found.");
  }

  return student;
};

const getRecruiterProfileByUserId = async (userId) => {
  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId }
  });

  if (!recruiter) {
    throw new ApiError(404, "Recruiter profile not found.");
  }

  return recruiter;
};

const ensureJobExistsAndPublished = async (jobId) => {
  const job = await prisma.job.findUnique({
    where: { id: Number(jobId) },
    include: {
      recruiter: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!job) {
    throw new ApiError(404, "Job not found.");
  }

  if (!job.isPublished) {
    throw new ApiError(400, "This job is not currently published.");
  }

  return job;
};

const validateEligibility = (student, job) => {
  if (new Date() > new Date(job.applicationDeadline)) {
    throw new ApiError(400, "Application deadline has passed.");
  }

  if (student.cgpa < job.minCgpa) {
    throw new ApiError(
      400,
      `Not eligible: minimum CGPA required is ${job.minCgpa}.`
    );
  }

  if (student.backlogCount > job.maxBacklogs) {
    throw new ApiError(
      400,
      `Not eligible: maximum allowed backlogs are ${job.maxBacklogs}.`
    );
  }

  if (!job.allowedPrograms.includes(student.program)) {
    throw new ApiError(
      400,
      `Not eligible: your program (${student.program}) is not allowed for this job.`
    );
  }
};

export const applyToJob = async (userId, payload) => {
  const student = await getStudentProfileByUserId(userId);
  const job = await ensureJobExistsAndPublished(payload.jobId);

  // prevent self-logic issues early
  const existingApplication = await prisma.application.findUnique({
    where: {
      studentId_jobId: {
        studentId: student.id,
        jobId: Number(payload.jobId)
      }
    }
  });

  if (existingApplication) {
    throw new ApiError(409, "You have already applied to this job.");
  }

  validateEligibility(student, job);

  const application = await prisma.application.create({
    data: {
      studentId: student.id,
      jobId: Number(payload.jobId),
      status: APPLICATION_STATUS.APPLIED
    },
    include: applicationInclude
  });

  return application;
};

export const getMyApplications = async (userId) => {
  const student = await getStudentProfileByUserId(userId);

  const applications = await prisma.application.findMany({
    where: {
      studentId: student.id
    },
    include: applicationInclude,
    orderBy: {
      appliedAt: "desc"
    }
  });

  return applications;
};

export const getApplicationByIdForStudent = async (userId, applicationId) => {
  const student = await getStudentProfileByUserId(userId);

  const application = await prisma.application.findFirst({
    where: {
      id: Number(applicationId),
      studentId: student.id
    },
    include: applicationInclude
  });

  if (!application) {
    throw new ApiError(404, "Application not found.");
  }

  return application;
};

export const deleteApplicationByStudent = async (userId, applicationId) => {
  const student = await getStudentProfileByUserId(userId);

  const application = await prisma.application.findFirst({
    where: {
      id: Number(applicationId),
      studentId: student.id
    },
    include: {
      booking: true
    }
  });

  if (!application) {
    throw new ApiError(404, "Application not found.");
  }

  if (
    application.status !== APPLICATION_STATUS.APPLIED &&
    application.status !== APPLICATION_STATUS.REJECTED
  ) {
    throw new ApiError(
      400,
      "Only applications in APPLIED or REJECTED state can be withdrawn/deleted."
    );
  }

  await prisma.$transaction(async (tx) => {
    if (application.booking) {
      await tx.interviewBooking.delete({
        where: { applicationId: application.id }
      });
    }

    await tx.application.delete({
      where: { id: application.id }
    });
  });

  return { deleted: true };
};

export const getApplicationsForRecruiter = async (userId) => {
  const recruiter = await getRecruiterProfileByUserId(userId);

  const applications = await prisma.application.findMany({
    where: {
      job: {
        recruiterId: recruiter.id
      }
    },
    include: applicationInclude,
    orderBy: {
      appliedAt: "desc"
    }
  });

  return applications;
};

export const getApplicationsForRecruiterJob = async (userId, jobId) => {
  const recruiter = await getRecruiterProfileByUserId(userId);

  const job = await prisma.job.findFirst({
    where: {
      id: Number(jobId),
      recruiterId: recruiter.id
    }
  });

  if (!job) {
    throw new ApiError(404, "Job not found or access denied.");
  }

  const applications = await prisma.application.findMany({
    where: {
      jobId: Number(jobId)
    },
    include: applicationInclude,
    orderBy: {
      appliedAt: "desc"
    }
  });

  return applications;
};

export const updateApplicationStatusByRecruiter = async (
  userId,
  applicationId,
  status
) => {
  const recruiter = await getRecruiterProfileByUserId(userId);

  const application = await prisma.application.findFirst({
    where: {
      id: Number(applicationId),
      job: {
        recruiterId: recruiter.id
      }
    },
    include: {
      job: true,
      booking: true
    }
  });

  if (!application) {
    throw new ApiError(404, "Application not found or access denied.");
  }

  // simple workflow protection
  const allowedTransitions = {
    APPLIED: ["SHORTLISTED", "REJECTED"],
    SHORTLISTED: ["INTERVIEW_SCHEDULED", "REJECTED"],
    INTERVIEW_SCHEDULED: ["INTERVIEW_COMPLETED", "REJECTED"],
    INTERVIEW_COMPLETED: ["OFFERED", "REJECTED"],
    OFFERED: ["HIRED", "REJECTED"],
    REJECTED: [],
    HIRED: []
  };

  const currentStatus = application.status;

  if (currentStatus === status) {
    throw new ApiError(400, `Application is already in ${status} status.`);
  }

  const nextAllowed = allowedTransitions[currentStatus] || [];

  if (!nextAllowed.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status transition from ${currentStatus} to ${status}.`
    );
  }

  if (status === APPLICATION_STATUS.INTERVIEW_SCHEDULED && !application.booking) {
    throw new ApiError(
      400,
      "Cannot set INTERVIEW_SCHEDULED until an interview slot has been booked."
    );
  }

  const updatedApplication = await prisma.application.update({
    where: { id: Number(applicationId) },
    data: {
      status
    },
    include: applicationInclude
  });

  return updatedApplication;
};