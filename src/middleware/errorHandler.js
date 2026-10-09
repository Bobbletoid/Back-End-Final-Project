import { Prisma } from "@prisma/client";

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Resource not found
    if (err.code === "P2025") {
      return res.status(404).json({
        error: "Resource not found",
      });
    }

    // Unique constraint violation
    if (err.code === "P2002") {
      return res.status(400).json({
        error: "A resource with this value already exists",
      });
    }

    // Foreign key constraint violation
    if (err.code === "P2003") {
      return res.status(400).json({
        error: "Invalid related resource",
      });
    }

    // Invalid database value
    if (err.code === "P2000" || err.code === "P2011") {
      return res.status(400).json({
        error: "Invalid request data",
      });
    }
  }

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: "Invalid request data",
    });
  }

  // Server-side error
  return res.status(500).json({
    error: "An error occurred on the server, please double-check your request!",
  });
}
