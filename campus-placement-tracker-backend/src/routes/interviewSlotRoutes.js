import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { USER_ROLES } from "../utils/statusConstants.js";
import {
  createSlotValidator,
  updateSlotValidator,
  slotIdParamValidator,
  jobIdParamValidatorForSlots,
  bookSlotValidator
} from "../validators/slotValidators.js";
import {
  createSlotHandler,
  getSlotsByJobHandler,
  updateSlotHandler,
  deleteSlotHandler,
  bookSlotHandler
} from "../controllers/interviewSlotController.js";

const router = express.Router();

/**
 * Public / authenticated read
 */
router.get(
  "/job/:jobId",
  jobIdParamValidatorForSlots,
  validate,
  getSlotsByJobHandler
);

/**
 * Recruiter routes
 */
router.post(
  "/",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  createSlotValidator,
  validate,
  createSlotHandler
);

router.put(
  "/:id",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  updateSlotValidator,
  validate,
  updateSlotHandler
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  slotIdParamValidator,
  validate,
  deleteSlotHandler
);

/**
 * Student booking route
 */
router.post(
  "/:id/book",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  bookSlotValidator,
  validate,
  bookSlotHandler
);

export default router;