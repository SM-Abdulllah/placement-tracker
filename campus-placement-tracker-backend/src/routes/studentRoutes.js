import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { getMyStudentProfile } from "../controllers/studentController.js";
import { USER_ROLES } from "../utils/statusConstants.js";
import { getAvailableJobsForStudentHandler } from "../controllers/jobController.js";
import {
  getMyApplicationsHandler,
  getMyApplicationByIdHandler,
  deleteMyApplicationHandler
} from "../controllers/applicationController.js";
import { applicationIdParamValidator } from "../validators/applicationValidators.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = express.Router();

router.get(
  "/me",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  getMyStudentProfile
);

router.get(
  "/jobs/available",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  getAvailableJobsForStudentHandler
);

router.get(
  "/me/applications",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  getMyApplicationsHandler
);

router.get(
  "/me/applications/:id",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  applicationIdParamValidator,
  validate,
  getMyApplicationByIdHandler
);

router.delete(
  "/me/applications/:id",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  applicationIdParamValidator,
  validate,
  deleteMyApplicationHandler
);

export default router;