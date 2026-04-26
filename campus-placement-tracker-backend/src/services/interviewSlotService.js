import prisma from "../db/prisma.js";
import ApiError from "../utils/ApiError.js";
import {
  APPLICATION_STATUS,
  SLOT_STATUS,
  USER_ROLES
} from "../utils/statusConstants.js";

const slotInclude = {
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
      application: {
        include: {
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
          }
        }
      }
    }
  }
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

const getStudentProfileByUserId = async (userId) => {
  const student = await prisma.studentProfile.findUnique({
    where: { userId }
  });

  if (!student) {
    throw new ApiError(404, "Student profile not found.");
  }

  return student;
};

const ensureValidTimeRange = (date, startTime, endTime) => {
  const parsedDate = new Date(date);
  const parsedStart = new Date(startTime);
  const parsedEnd = new Date(endTime);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    Number.isNaN(parsedStart.getTime()) ||
    Number.isNaN(parsedEnd.getTime())
  ) {
    throw new ApiError(400, "Invalid date/time values.");
  }

  if (parsedStart >= parsedEnd) {
    throw new ApiError(400, "End time must be after start time.");
  }

  if (parsedStart <= new Date()) {
    throw new ApiError(400, "Interview slot must start in the future.");
  }

  return {
    parsedDate,
    parsedStart,
    parsedEnd
  };
};

const ensureRecruiterOwnsJob = async (recruiterId, jobId) => {
  const job = await prisma.job.findFirst({
    where: {
      id: Number(jobId),
      recruiterId
    }
  });

  if (!job) {
    throw new ApiError(404, "Job not found or access denied.");
  }

  return job;
};

const ensureRecruiterOwnsSlot = async (recruiterId, slotId) => {
  const slot = await prisma.interviewSlot.findFirst({
    where: {
      id: Number(slotId),
      job: {
        recruiterId
      }
    },
    include: slotInclude
  });

  if (!slot) {
    throw new ApiError(404, "Slot not found or access denied.");
  }

  return slot;
};

export const createSlot = async (userId, payload) => {
  const recruiter = await getRecruiterProfileByUserId(userId);
  await ensureRecruiterOwnsJob(recruiter.id, payload.jobId);

  const { parsedDate, parsedStart, parsedEnd } = ensureValidTimeRange(
    payload.date,
    payload.startTime,
    payload.endTime
  );

  const slot = await prisma.interviewSlot.create({
    data: {
      jobId: Number(payload.jobId),
      date: parsedDate,
      startTime: parsedStart,
      endTime: parsedEnd,
      status: SLOT_STATUS.AVAILABLE
    },
    include: slotInclude
  });

  return slot;
};

export const getSlotsByJob = async (user, jobId, onlyAvailable = false) => {
  const where = {
    jobId: Number(jobId)
  };

  if (user.role === USER_ROLES.RECRUITER) {
    const recruiter = await getRecruiterProfileByUserId(user.id);
    await ensureRecruiterOwnsJob(recruiter.id, jobId);
  }

  if (user.role === USER_ROLES.STUDENT) {
    const student = await getStudentProfileByUserId(user.id);
    const shortlistedApplication = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        jobId: Number(jobId),
        status: APPLICATION_STATUS.SHORTLISTED
      }
    });

    if (!shortlistedApplication) {
      throw new ApiError(
        403,
        "Interview slots are available only for shortlisted applications."
      );
    }

    onlyAvailable = true;
  }

  if (onlyAvailable) {
    where.status = SLOT_STATUS.AVAILABLE;
    where.startTime = {
      gt: new Date()
    };
  }

  const slots = await prisma.interviewSlot.findMany({
    where,
    include: slotInclude,
    orderBy: {
      startTime: "asc"
    }
  });

  return slots;
};

export const updateSlot = async (userId, slotId, payload) => {
  const recruiter = await getRecruiterProfileByUserId(userId);
  const existingSlot = await ensureRecruiterOwnsSlot(recruiter.id, slotId);

  if (existingSlot.booking) {
    throw new ApiError(400, "Booked slots cannot be edited.");
  }

  const updateData = {};

  const date = payload.date ?? existingSlot.date;
  const startTime = payload.startTime ?? existingSlot.startTime;
  const endTime = payload.endTime ?? existingSlot.endTime;

  if (
    payload.date !== undefined ||
    payload.startTime !== undefined ||
    payload.endTime !== undefined
  ) {
    const { parsedDate, parsedStart, parsedEnd } = ensureValidTimeRange(
      date,
      startTime,
      endTime
    );

    updateData.date = parsedDate;
    updateData.startTime = parsedStart;
    updateData.endTime = parsedEnd;
  }

  if (payload.status !== undefined) {
    if (existingSlot.booking && payload.status !== SLOT_STATUS.BOOKED) {
      throw new ApiError(400, "Booked slot status cannot be changed manually.");
    }

    if (!existingSlot.booking && payload.status === SLOT_STATUS.BOOKED) {
      throw new ApiError(400, "A slot can be marked BOOKED only through a student booking.");
    }

    updateData.status = payload.status;
  }

  const updatedSlot = await prisma.interviewSlot.update({
    where: {
      id: Number(slotId)
    },
    data: updateData,
    include: slotInclude
  });

  return updatedSlot;
};

export const deleteSlot = async (userId, slotId) => {
  const recruiter = await getRecruiterProfileByUserId(userId);
  const slot = await ensureRecruiterOwnsSlot(recruiter.id, slotId);

  if (slot.booking) {
    throw new ApiError(400, "Booked slot cannot be deleted.");
  }

  await prisma.interviewSlot.delete({
    where: {
      id: Number(slotId)
    }
  });

  return { deleted: true };
};

export const bookSlot = async (userId, slotId, applicationId) => {
  const student = await getStudentProfileByUserId(userId);

  return prisma.$transaction(async (tx) => {
    const slot = await tx.interviewSlot.findUnique({
      where: { id: Number(slotId) },
      include: {
        job: true,
        booking: true
      }
    });

    if (!slot) {
      throw new ApiError(404, "Slot not found.");
    }

    if (slot.status !== SLOT_STATUS.AVAILABLE) {
      throw new ApiError(400, "This slot is no longer available.");
    }

    if (slot.booking) {
      throw new ApiError(409, "This slot has already been booked.");
    }

    if (new Date(slot.startTime) <= new Date()) {
      throw new ApiError(400, "Cannot book a past slot.");
    }

    const application = await tx.application.findFirst({
      where: {
        id: Number(applicationId),
        studentId: student.id
      },
      include: {
        booking: true,
        job: true
      }
    });

    if (!application) {
      throw new ApiError(404, "Application not found.");
    }

    if (application.jobId !== slot.jobId) {
      throw new ApiError(
        400,
        "Selected slot does not belong to the same job as this application."
      );
    }

    if (application.status !== APPLICATION_STATUS.SHORTLISTED) {
      throw new ApiError(
        400,
        "Only shortlisted applications can book interview slots."
      );
    }

    if (application.booking) {
      throw new ApiError(409, "This application already has a booked interview slot.");
    }

    const conflictingBooking = await tx.interviewBooking.findFirst({
      where: {
        application: {
          studentId: student.id
        },
        slot: {
          startTime: {
            lt: slot.endTime
          },
          endTime: {
            gt: slot.startTime
          }
        }
      },
      include: {
        slot: true,
        application: {
          include: {
            job: true
          }
        }
      }
    });

    if (conflictingBooking) {
      throw new ApiError(
        400,
        "Interview conflict detected. You already have another interview during this time."
      );
    }

    const reservedSlot = await tx.interviewSlot.updateMany({
      where: {
        id: slot.id,
        status: SLOT_STATUS.AVAILABLE,
        startTime: {
          gt: new Date()
        }
      },
      data: {
        status: SLOT_STATUS.BOOKED
      }
    });

    if (reservedSlot.count !== 1) {
      throw new ApiError(409, "This slot has just been booked by another student.");
    }

    const booking = await tx.interviewBooking.create({
      data: {
        applicationId: application.id,
        slotId: slot.id
      }
    });

    await tx.application.update({
      where: {
        id: application.id
      },
      data: {
        status: APPLICATION_STATUS.INTERVIEW_SCHEDULED
      }
    });

    const finalBooking = await tx.interviewBooking.findUnique({
      where: { id: booking.id },
      include: {
        slot: {
          include: {
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
            }
          }
        },
        application: {
          include: {
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
            }
          }
        }
      }
    });

    return finalBooking;
  });
};
