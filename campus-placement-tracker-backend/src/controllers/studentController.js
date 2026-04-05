import catchAsync from "../utils/catchAsync.js";
import { successResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getMyStudentProfile = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      studentProfile: true
    }
  });

  if (!user || !user.studentProfile) {
    throw new ApiError(404, "Student profile not found.");
  }

  return successResponse(res, 200, "Student profile fetched successfully.", {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    studentProfile: user.studentProfile
  });
});