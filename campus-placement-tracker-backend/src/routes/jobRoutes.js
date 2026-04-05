import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { USER_ROLES } from "../utils/statusConstants.js";
import {
  createJobValidator,
  updateJobValidator,
  jobIdParamValidator
} from "../validators/jobValidators.js";
import {
  createJobHandler,
  getRecruiterJobsHandler,
  getRecruiterJobByIdHandler,
  updateRecruiterJobHandler,
  deleteRecruiterJobHandler,
  getPublicJobsHandler,
  getPublicJobByIdHandler,
  getAvailableJobsForStudentHandler
} from "../controllers/jobController.js";

const router = express.Router();

/**
 * Student routes
 */
router.get(
  "/student/available/list",
  protect,
  authorizeRoles(USER_ROLES.STUDENT),
  getAvailableJobsForStudentHandler
);

/**
 * Recruiter private routes
 */
router.get(
  "/recruiter/my-jobs",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  getRecruiterJobsHandler
);

router.post(
  "/recruiter",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  createJobValidator,
  validate,
  createJobHandler
);

router.get(
  "/recruiter/:id",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  jobIdParamValidator,
  validate,
  getRecruiterJobByIdHandler
);

router.put(
  "/recruiter/:id",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  updateJobValidator,
  validate,
  updateRecruiterJobHandler
);

router.delete(
  "/recruiter/:id",
  protect,
  authorizeRoles(USER_ROLES.RECRUITER),
  jobIdParamValidator,
  validate,
  deleteRecruiterJobHandler
);

/**
 * Public routes
 */
router.get("/", getPublicJobsHandler);
router.get("/:id", jobIdParamValidator, validate, getPublicJobByIdHandler);

export default router;