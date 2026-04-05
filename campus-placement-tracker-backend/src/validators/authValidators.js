import { body } from "express-validator";

export const registerStudentValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required."),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),

  body("rollNumber")
    .trim()
    .notEmpty()
    .withMessage("Roll number is required."),

  body("cgpa")
    .isFloat({ min: 0, max: 4.0 })
    .withMessage("CGPA must be between 0 and 4.0."),

  body("program")
    .trim()
    .notEmpty()
    .withMessage("Program is required."),

  body("backlogCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Backlog count must be 0 or greater."),

  body("semester")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Semester must be a positive integer.")
];

export const registerRecruiterValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required."),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),

  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required."),

  body("companyEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Company email must be valid."),

  body("companyPhone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Company phone cannot be empty if provided.")
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required."),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
];