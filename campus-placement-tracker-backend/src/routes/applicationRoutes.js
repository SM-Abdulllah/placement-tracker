import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { USER_ROLES } from "../utils/statusConstants.js";
import {
  createApplicationValidator,
  applicationIdParamValidator,
  recruiterJobApplicationsParamValidator,
  updateApplicationStatusValidator
} from "../validators/applicationValidators.js";
import {
  applyToJobHandler,
  getMyApplicationsHandler,
  getMyApplicationByIdHandler,
  deleteMyApplicationHandler,
  getRecruiterApplicationsHandler,
  getRecruiterApplicationsForJobHandler,
  updateApplicationStatusHandler
} from "../controllers/applicationController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  createApplicationValidator,
  validate,
  applyToJobHandler
);

router.get(
  "/my",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  getMyApplicationsHandler
);

router.get(
  "/my/:id",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  applicationIdParamValidator,
  validate,
  getMyApplicationByIdHandler
);

router.delete(
  "/my/:id",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  applicationIdParamValidator,
  validate,
  deleteMyApplicationHandler
);

router.get(
  "/recruiter/all",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  getRecruiterApplicationsHandler
);

router.get(
  "/recruiter/job/:jobId",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  recruiterJobApplicationsParamValidator,
  validate,
  getRecruiterApplicationsForJobHandler
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  updateApplicationStatusValidator,
  validate,
  updateApplicationStatusHandler
);

export default router;