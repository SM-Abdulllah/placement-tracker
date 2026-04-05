import { body, param } from "express-validator";

export const createApplicationValidator = [
  body("jobId")
    .isInt({ min: 1 })
    .withMessage("Job ID must be a positive integer.")
];

export const applicationIdParamValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Application ID must be a positive integer.")
];

export const recruiterJobApplicationsParamValidator = [
  param("jobId")
    .isInt({ min: 1 })
    .withMessage("Job ID must be a positive integer.")
];

export const updateApplicationStatusValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Application ID must be a positive integer."),

  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required.")
    .isIn([
      "APPLIED",
      "SHORTLISTED",
      "REJECTED",
      "INTERVIEW_SCHEDULED",
      "INTERVIEW_COMPLETED",
      "OFFERED",
      "HIRED"
    ])
    .withMessage("Invalid application status.")
];