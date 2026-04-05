import catchAsync from "../utils/catchAsync.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  createJob,
  getRecruiterJobs,
  getRecruiterJobById,
  updateRecruiterJob,
  deleteRecruiterJob,
  getPublicJobs,
  getPublicJobById,
  getAvailableJobsForStudent
} from "../services/jobService.js";

export const createJobHandler = catchAsync(async (req, res) => {
  const job = await createJob(req.user.id, req.body);

  return successResponse(res, 201, "Job created successfully.", job);
});

export const getRecruiterJobsHandler = catchAsync(async (req, res) => {
  const jobs = await getRecruiterJobs(req.user.id);

  return successResponse(res, 200, "Recruiter jobs fetched successfully.", jobs);
});

export const getRecruiterJobByIdHandler = catchAsync(async (req, res) => {
  const job = await getRecruiterJobById(req.user.id, req.params.id);

  return successResponse(res, 200, "Recruiter job fetched successfully.", job);
});

export const updateRecruiterJobHandler = catchAsync(async (req, res) => {
  const job = await updateRecruiterJob(req.user.id, req.params.id, req.body);

  return successResponse(res, 200, "Job updated successfully.", job);
});

export const deleteRecruiterJobHandler = catchAsync(async (req, res) => {
  const result = await deleteRecruiterJob(req.user.id, req.params.id);

  return successResponse(res, 200, "Job deleted successfully.", result);
});

export const getPublicJobsHandler = catchAsync(async (req, res) => {
  const jobs = await getPublicJobs();

  return successResponse(res, 200, "Public jobs fetched successfully.", jobs);
});

export const getPublicJobByIdHandler = catchAsync(async (req, res) => {
  const job = await getPublicJobById(req.params.id);

  return successResponse(res, 200, "Job details fetched successfully.", job);
});

export const getAvailableJobsForStudentHandler = catchAsync(async (req, res) => {
  const jobs = await getAvailableJobsForStudent(req.user.id);

  return successResponse(
    res,
    200,
    "Eligible jobs fetched successfully for student.",
    jobs
  );
});