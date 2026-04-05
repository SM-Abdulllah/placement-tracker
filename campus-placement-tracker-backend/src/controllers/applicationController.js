import catchAsync from "../utils/catchAsync.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  applyToJob,
  getMyApplications,
  getApplicationByIdForStudent,
  deleteApplicationByStudent,
  getApplicationsForRecruiter,
  getApplicationsForRecruiterJob,
  updateApplicationStatusByRecruiter
} from "../services/applicationService.js";

export const applyToJobHandler = catchAsync(async (req, res) => {
  const application = await applyToJob(req.user.id, req.body);

  return successResponse(
    res,
    201,
    "Application submitted successfully.",
    application
  );
});

export const getMyApplicationsHandler = catchAsync(async (req, res) => {
  const applications = await getMyApplications(req.user.id);

  return successResponse(
    res,
    200,
    "My applications fetched successfully.",
    applications
  );
});

export const getMyApplicationByIdHandler = catchAsync(async (req, res) => {
  const application = await getApplicationByIdForStudent(req.user.id, req.params.id);

  return successResponse(
    res,
    200,
    "Application fetched successfully.",
    application
  );
});

export const deleteMyApplicationHandler = catchAsync(async (req, res) => {
  const result = await deleteApplicationByStudent(req.user.id, req.params.id);

  return successResponse(
    res,
    200,
    "Application deleted successfully.",
    result
  );
});

export const getRecruiterApplicationsHandler = catchAsync(async (req, res) => {
  const applications = await getApplicationsForRecruiter(req.user.id);

  return successResponse(
    res,
    200,
    "Recruiter applications fetched successfully.",
    applications
  );
});

export const getRecruiterApplicationsForJobHandler = catchAsync(async (req, res) => {
  const applications = await getApplicationsForRecruiterJob(
    req.user.id,
    req.params.jobId
  );

  return successResponse(
    res,
    200,
    "Applications for recruiter job fetched successfully.",
    applications
  );
});

export const updateApplicationStatusHandler = catchAsync(async (req, res) => {
  const application = await updateApplicationStatusByRecruiter(
    req.user.id,
    req.params.id,
    req.body.status
  );

  return successResponse(
    res,
    200,
    "Application status updated successfully.",
    application
  );
});