import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { getMyRecruiterProfile } from "../controllers/recruiterController.js";
import { USER_ROLES } from "../utils/statusConstants.js";
import {
  createJobHandler,
  getRecruiterJobsHandler,
  getRecruiterJobByIdHandler,
  updateRecruiterJobHandler,
  deleteRecruiterJobHandler
} from "../controllers/jobController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createJobValidator,
  updateJobValidator,
  jobIdParamValidator
} from "../validators/jobValidators.js";

const router = express.Router();

router.get(
  "/me",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  getMyRecruiterProfile
);

router.get(
  "/jobs",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  getRecruiterJobsHandler
);

router.post(
  "/jobs",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  createJobValidator,
  validate,
  createJobHandler
);

router.get(
  "/jobs/:id",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  jobIdParamValidator,
  validate,
  getRecruiterJobByIdHandler
);

router.put(
  "/jobs/:id",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  updateJobValidator,
  validate,
  updateRecruiterJobHandler
);

router.delete(
  "/jobs/:id",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  jobIdParamValidator,
  validate,
  deleteRecruiterJobHandler
);

export default router;