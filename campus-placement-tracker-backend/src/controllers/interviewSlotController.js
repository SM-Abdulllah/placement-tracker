import catchAsync from "../utils/catchAsync.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  createSlot,
  getSlotsByJob,
  updateSlot,
  deleteSlot,
  bookSlot
} from "../services/interviewSlotService.js";

export const createSlotHandler = catchAsync(async (req, res) => {
  const slot = await createSlot(req.user.id, req.body);

  return successResponse(
    res,
    201,
    "Interview slot created successfully.",
    slot
  );
});

export const getSlotsByJobHandler = catchAsync(async (req, res) => {
  const onlyAvailable = req.query.available === "true";
  const slots = await getSlotsByJob(req.params.jobId, onlyAvailable);

  return successResponse(
    res,
    200,
    "Interview slots fetched successfully.",
    slots
  );
});

export const updateSlotHandler = catchAsync(async (req, res) => {
  const slot = await updateSlot(req.user.id, req.params.id, req.body);

  return successResponse(
    res,
    200,
    "Interview slot updated successfully.",
    slot
  );
});

export const deleteSlotHandler = catchAsync(async (req, res) => {
  const result = await deleteSlot(req.user.id, req.params.id);

  return successResponse(
    res,
    200,
    "Interview slot deleted successfully.",
    result
  );
});

export const bookSlotHandler = catchAsync(async (req, res) => {
  const booking = await bookSlot(req.user.id, req.params.id, req.body.applicationId);

  return successResponse(
    res,
    200,
    "Interview slot booked successfully.",
    booking
  );
});