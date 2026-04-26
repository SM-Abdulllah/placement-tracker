import express from "express";
import {
  registerStudentHandler,
  registerRecruiterHandler,
  loginHandler,
  meHandler,
  logoutHandler
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
router.post("/logout", protect, logoutHandler);

export default router;
