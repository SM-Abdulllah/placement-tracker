import catchAsync from "../utils/catchAsync.js";
import { successResponse } from "../utils/apiResponse.js";
import prisma from "../db/prisma.js";
import ApiError from "../utils/ApiError.js";

export const getMyRecruiterProfile = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      recruiterProfile: true
    }
  });

  if (!user || !user.recruiterProfile) {
    throw new ApiError(404, "Recruiter profile not found.");
  }

  return successResponse(res, 200, "Recruiter profile fetched successfully.", {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    recruiterProfile: user.recruiterProfile
  });
});