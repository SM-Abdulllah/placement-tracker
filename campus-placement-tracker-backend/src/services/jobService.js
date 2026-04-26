import prisma from "../db/prisma.js";
import ApiError from "../utils/ApiError.js";

const includeJobRelations = {
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
  },
  _count: {
    select: {
      applications: true,
      interviewSlots: true
    }
  }
};

const ensureFutureDeadline = (deadline) => {
  const parsed = new Date(deadline);

  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, "Invalid application deadline.");
  }

  if (parsed <= new Date()) {
    throw new ApiError(400, "Application deadline must be in the future.");
  }

  return parsed;
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

const getOwnedJobOrThrow = async (jobId, recruiterId) => {
  const job = await prisma.job.findFirst({
    where: {
      id: Number(jobId),
      recruiterId
    },
    include: includeJobRelations
  });

  if (!job) {
    throw new ApiError(404, "Job not found or access denied.");
  }

  return job;
};

export const createJob = async (userId, payload) => {
  const recruiter = await getRecruiterProfileByUserId(userId);

  const deadline = ensureFutureDeadline(payload.applicationDeadline);

  const job = await prisma.job.create({
    data: {
      recruiterId: recruiter.id,
      title: payload.title,
      description: payload.description,
      location: payload.location || null,
      jobType: payload.jobType || null,
      salaryPackage: payload.salaryPackage || null,
      minCgpa: parseFloat(payload.minCgpa),
      maxBacklogs: parseInt(payload.maxBacklogs, 10),
      allowedPrograms: payload.allowedPrograms,
      applicationDeadline: deadline,
      isPublished:
        typeof payload.isPublished === "boolean" ? payload.isPublished : true
    },
    include: includeJobRelations
  });

  return job;
};

export const getRecruiterJobs = async (userId) => {
  const recruiter = await getRecruiterProfileByUserId(userId);

  return prisma.job.findMany({
    where: {
      recruiterId: recruiter.id
    },
    include: includeJobRelations,
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getRecruiterJobById = async (userId, jobId) => {
  const recruiter = await getRecruiterProfileByUserId(userId);
  return getOwnedJobOrThrow(jobId, recruiter.id);
};

export const updateRecruiterJob = async (userId, jobId, payload) => {
  const recruiter = await getRecruiterProfileByUserId(userId);
  await getOwnedJobOrThrow(jobId, recruiter.id);

  const updateData = {};

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.location !== undefined) updateData.location = payload.location || null;
  if (payload.jobType !== undefined) updateData.jobType = payload.jobType || null;
  if (payload.salaryPackage !== undefined) updateData.salaryPackage = payload.salaryPackage || null;
  if (payload.minCgpa !== undefined) updateData.minCgpa = parseFloat(payload.minCgpa);
  if (payload.maxBacklogs !== undefined) updateData.maxBacklogs = parseInt(payload.maxBacklogs, 10);
  if (payload.allowedPrograms !== undefined) updateData.allowedPrograms = payload.allowedPrograms;
  if (payload.isPublished !== undefined) updateData.isPublished = payload.isPublished;

  if (payload.applicationDeadline !== undefined) {
    updateData.applicationDeadline = ensureFutureDeadline(payload.applicationDeadline);
  }

  const updatedJob = await prisma.job.update({
    where: { id: Number(jobId) },
    data: updateData,
    include: includeJobRelations
  });

  return updatedJob;
};

export const deleteRecruiterJob = async (userId, jobId) => {
  const recruiter = await getRecruiterProfileByUserId(userId);
  await getOwnedJobOrThrow(jobId, recruiter.id);

  await prisma.job.delete({
    where: { id: Number(jobId) }
  });

  return { deleted: true };
};

export const getPublicJobs = async () => {
  return prisma.job.findMany({
    where: {
      isPublished: true,
      applicationDeadline: {
        gt: new Date()
      }
    },
    include: includeJobRelations,
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getPublicJobById = async (jobId) => {
  const job = await prisma.job.findFirst({
    where: {
      id: Number(jobId),
      isPublished: true
    },
    include: includeJobRelations
  });

  if (!job) {
    throw new ApiError(404, "Job not found.");
  }

  return job;
};

export const getAvailableJobsForStudent = async (userId) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      applications: {
        select: {
          jobId: true
        }
      }
    }
  });

  if (!student) {
    throw new ApiError(404, "Student profile not found.");
  }

  const alreadyAppliedJobIds = student.applications.map((app) => app.jobId);

  const jobs = await prisma.job.findMany({
    where: {
      isPublished: true,
      applicationDeadline: {
        gt: new Date()
      },
      id: {
        notIn: alreadyAppliedJobIds.length ? alreadyAppliedJobIds : [-1]
      }
    },
    include: includeJobRelations,
    orderBy: {
      createdAt: "desc"
    }
  });

  const eligibleJobs = jobs.filter((job) => {
    const cgpaOk = student.cgpa >= job.minCgpa;
    const backlogOk = student.backlogCount <= job.maxBacklogs;
    const programOk = job.allowedPrograms.includes(student.program);

    return cgpaOk && backlogOk && programOk;
  });

  return eligibleJobs;
};
