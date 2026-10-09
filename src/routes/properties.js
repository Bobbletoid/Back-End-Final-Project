import express from "express";
import {
  // All the helper functions from propertyService
  getProperties,
  getPropertyById,
  findProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../services/propertyService.js";
// Authentication for POST, PUT, DELETE
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /properties
// GET /properties?location=...
// GET /properties?pricePerNight=...
// GET /properties?location=...&pricePerNight=...
router.get("/", async (req, res, next) => {
  try {
    const { location, pricePerNight } = req.query;

    const hasLocation = location !== undefined;
    const hasPrice = pricePerNight !== undefined;

    // Check if property has a price and whether price is a number

    if (hasPrice && pricePerNight === "") {
      return res.status(400).json({
        error: "pricePerNight must be a valid number",
      });
    }

    if (hasPrice && Number.isNaN(Number(pricePerNight))) {
      return res.status(400).json({
        error: "pricePerNight must be a valid number",
      });
    }

    // Check whether location or price have been queried

    if (hasLocation || hasPrice) {
      const properties = await findProperties({
        location,
        pricePerNight: hasPrice ? Number(pricePerNight) : undefined,
      });

      return res.status(200).json(properties);
    }

    const properties = await getProperties();

    res.status(200).json(properties);
  } catch (error) {
    next(error);
  }
});

// POST /properties
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    // Decide which data needs to be provided
    const {
      title,
      description,
      location,
      pricePerNight,
      bedroomCount,
      bathRoomCount,
      maxGuestCount,
      hostId,
      rating,
    } = req.body;

    // Check if all fields have valid information

    if (
      title === undefined ||
      description === undefined ||
      location === undefined ||
      pricePerNight === undefined ||
      bedroomCount === undefined ||
      bathRoomCount === undefined ||
      maxGuestCount === undefined ||
      hostId === undefined ||
      rating === undefined
    ) {
      return res.status(400).json({
        error: "Missing required property information",
      });
    }

    // Check if provided numerical fields are numbers and whether rating is between 1 and 5

    if (
      typeof pricePerNight !== "number" ||
      typeof bedroomCount !== "number" ||
      typeof bathRoomCount !== "number" ||
      typeof maxGuestCount !== "number" ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        error: "Invalid property information",
      });
    }

    const property = await createProperty(req.body);

    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
});

// GET /properties/:id
router.get("/:id", async (req, res, next) => {
  try {
    const property = await getPropertyById(req.params.id);

    // Check if property exists

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
});

// PUT /properties/:id
router.put("/:id", authenticateToken, async (req, res, next) => {
  // First make sure that there's information to update

  try {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({
        error: "Request body cannot be empty",
      });
    }

    // Check if the property you're trying to update exists

    const existingProperty = await getPropertyById(req.params.id);

    if (!existingProperty) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    // Declare valid fields

    const allowedFields = [
      "title",
      "description",
      "location",
      "pricePerNight",
      "bedroomCount",
      "bathRoomCount",
      "maxGuestCount",
      "hostId",
      "rating",
    ];

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

    // Verify numerical fields...

    const numericFields = [
      "pricePerNight",
      "bedroomCount",
      "bathRoomCount",
      "maxGuestCount",
    ];

    // ...and throw error if false

    for (const field of numericFields) {
      if (
        req.body[field] !== undefined &&
        typeof req.body[field] !== "number"
      ) {
        return res.status(400).json({
          error: `${field} must be a number`,
        });
      }
    }

    // Check if rating is between 1 and 5 and throw error if false

    if (req.body.rating !== undefined) {
      if (
        typeof req.body.rating !== "number" ||
        req.body.rating < 1 ||
        req.body.rating > 5
      ) {
        return res.status(400).json({
          error: "Rating must be a number between 1 and 5",
        });
      }
    }

    // Otherwise, continue

    const property = await updateProperty(req.params.id, req.body);

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
});

// DELETE /properties/:id
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const existingProperty = await getPropertyById(req.params.id);

    // Check if property exists, otherwise throw error

    if (!existingProperty) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    await deleteProperty(req.params.id);

    res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
