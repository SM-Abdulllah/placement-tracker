import bcrypt from "bcrypt";
import prisma from "../db/prisma.js";
import ApiError from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";
import { USER_ROLES } from "../utils/statusConstants.js";

const sanitizeUser = (user) => {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    studentProfile: user.studentProfile || null,
    recruiterProfile: user.recruiterProfile || null,
    createdAt: user.createdAt
  };
};

export const registerStudent = async (payload) => {
  const {
    fullName,
    email,
    password,
    rollNumber,
    cgpa,
    program,
    backlogCount = 0,
    semester
  } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered.");
  }

  const existingRollNumber = await prisma.studentProfile.findUnique({
    where: { rollNumber }
  });

  if (existingRollNumber) {
    throw new ApiError(409, "Roll number is already registered.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: USER_ROLES.STUDENT,
      studentProfile: {
        create: {
          rollNumber,
          cgpa: parseFloat(cgpa),
          program,
          backlogCount: backlogCount ? parseInt(backlogCount, 10) : 0,
          semester: semester ? parseInt(semester, 10) : null
        }
      }
    },
    include: {
      studentProfile: true,
      recruiterProfile: true
    }
  });

  const token = signToken({
    userId: user.id,
    role: user.role
  });

  return {
    token,
    user: sanitizeUser(user)
  };
};

export const registerRecruiter = async (payload) => {
  const {
    fullName,
    email,
    password,
    companyName,
    companyEmail,
    companyPhone
  } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: USER_ROLES.RECRUITER,
      recruiterProfile: {
        create: {
          companyName,
          companyEmail,
          companyPhone
        }
      }
    },
    include: {
      studentProfile: true,
      recruiterProfile: true
    }
  });

  const token = signToken({
    userId: user.id,
    role: user.role
  });

  return {
    token,
    user: sanitizeUser(user)
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: true,
      recruiterProfile: true
    }
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = signToken({
    userId: user.id,
    role: user.role
  });

  return {
    token,
    user: sanitizeUser(user)
  };
};

export const getCurrentUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      recruiterProfile: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return sanitizeUser(user);
};