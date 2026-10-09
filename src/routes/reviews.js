import express from "express";
import {
  // All the helper functions from reviewService
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../services/reviewService.js";
// Authentication for POST, PUT, DELETE
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /reviews
router.get("/", async (req, res, next) => {
  try {
    const reviews = await getReviews();

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

// POST /reviews
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    // Decide which data needs to be provided
    const { userId, propertyId, rating, comment } = req.body;

    // Declare valid fields
    const allowedFields = ["userId", "propertyId", "rating", "comment"];

    // Check for invalid fields...

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field),
    );

    // ...and throw error if true

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: `Invalid field(s): ${invalidFields.join(", ")}`,
      });
    }

    // Check if all fields have valid information

    if (
      !userId ||
      !propertyId ||
      rating === undefined ||
      comment === undefined
    ) {
      return res.status(400).json({
        error: "Missing required review information",
      });
    }

    // Check if rating is a number, between 1 and 5

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be a number between 1 and 5",
      });
    }

    const review = await createReview(req.body);

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

// GET /reviews/:id
router.get("/:id", async (req, res, next) => {
  try {
    const review = await getReviewById(req.params.id);

    // Check if review exists

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
});

// PUT /reviews/:id
router.put("/:id", authenticateToken, async (req, res, next) => {
  // First make sure that there is information to update
  try {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({
        error: "Request body cannot be empty",
      });
    }

    // Check if the review you're trying to update exists

    const existingReview = await getReviewById(req.params.id);

    if (!existingReview) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    // Declare valid fields

    const allowedFields = ["userId", "propertyId", "rating", "comment"];

    // Check for invalid fields...

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field),
    );

    // ...and throw error if true

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: `Invalid field(s): ${invalidFields.join(", ")}`,
      });
    }

    // Check if rating is a number between 1 and 5

    if (
      req.body.rating !== undefined &&
      (typeof req.body.rating !== "number" ||
        req.body.rating < 1 ||
        req.body.rating > 5)
    ) {
      return res.status(400).json({
        error: "Rating must be a number between 1 and 5",
      });
    }

    // Otherwise, continue

    const review = await updateReview(req.params.id, req.body);

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
});

// DELETE /reviews/:id
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const existingReview = await getReviewById(req.params.id);

    // Check if review exists, otherwise throw error

    if (!existingReview) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    await deleteReview(req.params.id);

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
