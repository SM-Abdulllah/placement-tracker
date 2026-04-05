import { Prisma } from "@prisma/client";
import { errorResponse } from "../utils/apiResponse.js";

export const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, `Route not found: ${req.originalUrl}`);
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return errorResponse(res, 409, "Duplicate data violation.", err.meta);
    }

    if (err.code === "P2025") {
      return errorResponse(res, 404, "Requested record not found.");
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return errorResponse(res, statusCode, message, err.details || null);
};