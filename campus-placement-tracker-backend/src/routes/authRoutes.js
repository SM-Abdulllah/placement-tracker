import express from "express";
import {
  registerStudentHandler,
  registerRecruiterHandler,
  loginHandler,
  meHandler
} from "../controllers/authController.js";
import {
  registerStudentValidator,
  registerRecruiterValidator,
  loginValidator
} from "../validators/authValidators.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/register/student",
  registerStudentValidator,
  validate,
  registerStudentHandler
);

router.post(
  "/register/recruiter",
  registerRecruiterValidator,
  validate,
  registerRecruiterHandler
);

router.post(
  "/login",
  loginValidator,
  validate,
  loginHandler
);

router.get("/me", protect, meHandler);

export default router;