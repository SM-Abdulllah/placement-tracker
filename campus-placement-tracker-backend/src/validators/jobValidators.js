import { body, param } from "express-validator";

export const createJobValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Job description is required."),

  body("location")
    .optional()
    .trim(),

  body("jobType")
    .optional()
    .trim(),

  body("salaryPackage")
    .optional()
    .trim(),

  body("minCgpa")
    .isFloat({ min: 0, max: 4.0 })
    .withMessage("Minimum CGPA must be between 0 and 4.0."),

  body("maxBacklogs")
    .isInt({ min: 0 })
    .withMessage("Max backlogs must be 0 or greater."),

  body("allowedPrograms")
    .isArray({ min: 1 })
    .withMessage("Allowed programs must be a non-empty array."),

  body("allowedPrograms.*")
    .trim()
    .notEmpty()
    .withMessage("Program names in allowedPrograms cannot be empty."),

  body("applicationDeadline")
    .isISO8601()
    .withMessage("Application deadline must be a valid ISO date."),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be true or false.")
];

export const updateJobValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Job ID must be a positive integer."),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Job title cannot be empty."),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Job description cannot be empty."),

  body("location")
    .optional()
    .trim(),

  body("jobType")
    .optional()
    .trim(),

  body("salaryPackage")
    .optional()
    .trim(),

  body("minCgpa")
    .optional()
    .isFloat({ min: 0, max: 4.0 })
    .withMessage("Minimum CGPA must be between 0 and 4.0."),

  body("maxBacklogs")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Max backlogs must be 0 or greater."),

  body("allowedPrograms")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Allowed programs must be a non-empty array."),

  body("allowedPrograms.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Program names in allowedPrograms cannot be empty."),

  body("applicationDeadline")
    .optional()
    .isISO8601()
    .withMessage("Application deadline must be a valid ISO date."),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be true or false.")
];

export const jobIdParamValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Job ID must be a positive integer.")
];