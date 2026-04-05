import { body, param } from "express-validator";

export const createSlotValidator = [
  body("jobId")
    .isInt({ min: 1 })
    .withMessage("Job ID must be a positive integer."),

  body("date")
    .isISO8601()
    .withMessage("Date must be a valid ISO date."),

  body("startTime")
    .isISO8601()
    .withMessage("Start time must be a valid ISO datetime."),

  body("endTime")
    .isISO8601()
    .withMessage("End time must be a valid ISO datetime.")
];

export const updateSlotValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Slot ID must be a positive integer."),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO date."),

  body("startTime")
    .optional()
    .isISO8601()
    .withMessage("Start time must be a valid ISO datetime."),

  body("endTime")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid ISO datetime."),

  body("status")
    .optional()
    .isIn(["AVAILABLE", "BOOKED", "CANCELLED"])
    .withMessage("Invalid slot status.")
];

export const slotIdParamValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Slot ID must be a positive integer.")
];

export const jobIdParamValidatorForSlots = [
  param("jobId")
    .isInt({ min: 1 })
    .withMessage("Job ID must be a positive integer.")
];

export const bookSlotValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Slot ID must be a positive integer."),

  body("applicationId")
    .isInt({ min: 1 })
    .withMessage("Application ID must be a positive integer.")
];