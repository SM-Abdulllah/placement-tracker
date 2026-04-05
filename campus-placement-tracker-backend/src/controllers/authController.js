import catchAsync from "../utils/catchAsync.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  registerStudent,
  registerRecruiter,
  loginUser,
  getCurrentUserProfile
} from "../services/authService.js";

export const registerStudentHandler = catchAsync(async (req, res) => {
  const result = await registerStudent(req.body);

  return successResponse(
    res,
    201,
    "Student registered successfully.",
    result
  );
});

export const registerRecruiterHandler = catchAsync(async (req, res) => {
  const result = await registerRecruiter(req.body);

  return successResponse(
    res,
    201,
    "Recruiter registered successfully.",
    result
  );
});

export const loginHandler = catchAsync(async (req, res) => {
  const result = await loginUser(req.body);

  return successResponse(
    res,
    200,
    "Login successful.",
    result
  );
});

export const meHandler = catchAsync(async (req, res) => {
  const user = await getCurrentUserProfile(req.user.id);

  return successResponse(
    res,
    200,
    "Current user profile fetched successfully.",
    user
  );
});