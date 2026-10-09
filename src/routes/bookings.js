import express from "express";
import {
  // All the helper functions from bookingService
  getBookings,
  getBookingById,
  getBookingsByUserId,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../services/bookingService.js";
// Authentication for POST, PUT, DELETE
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /bookings
// GET /bookings?userId=...
router.get("/", async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (userId) {
      const bookings = await getBookingsByUserId(userId);
      return res.status(200).json(bookings);
    }

    const bookings = await getBookings();

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
});

// POST /bookings
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    // Decide which data needs to be provided
    const {
      userId,
      propertyId,
      checkinDate,
      checkoutDate,
      numberOfGuests,
      totalPrice,
      bookingStatus,
    } = req.body;

    // Declare valid fields

    const allowedFields = [
      "userId",
      "propertyId",
      "checkinDate",
      "checkoutDate",
      "numberOfGuests",
      "totalPrice",
      "bookingStatus",
    ];

    // Check for invalid fields...

    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field),
    );

    // ... and throw error if true

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: `Invalid field(s): ${invalidFields.join(", ")}`,
      });
    }

    // Check if all fields have valid information

    if (
      !userId ||
      !propertyId ||
      !checkinDate ||
      !checkoutDate ||
      numberOfGuests === undefined ||
      totalPrice === undefined ||
      !bookingStatus
    ) {
      return res.status(400).json({
        error: "Missing required booking information",
      });
    }

    // Check if numberOfGuests and totalPrice are numbers

    if (typeof numberOfGuests !== "number" || typeof totalPrice !== "number") {
      return res.status(400).json({
        error: "numberOfGuests and totalPrice must be numbers",
      });
    }

    // Check if checkin and checkout are dates

    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);

    // Check if provided dates are valid

    if (Number.isNaN(checkin.getTime()) || Number.isNaN(checkout.getTime())) {
      return res.status(400).json({
        error: "Invalid booking dates",
      });
    }

    // Check if checkout is AFTER checkin. Otherwise, throw error

    if (checkout <= checkin) {
      return res.status(400).json({
        error: "Checkout date must be after checkin date",
      });
    }

    const booking = await createBooking({
      ...req.body,
      checkinDate: checkin,
      checkoutDate: checkout,
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

// GET /bookings/:id
router.get("/:id", async (req, res, next) => {
  try {
    const booking = await getBookingById(req.params.id);

    // Check if booking exists

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
});

// PUT /bookings/:id
router.put("/:id", authenticateToken, async (req, res, next) => {
  // First make sure that there's information to update

  try {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({
        error: "Request body cannot be empty",
      });
    }

    // Check if the booking you're trying to update exists

    const existingBooking = await getBookingById(req.params.id);

    if (!existingBooking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    // Declare valid fields

    const allowedFields = [
      "userId",
      "propertyId",
      "checkinDate",
      "checkoutDate",
      "numberOfGuests",
      "totalPrice",
      "bookingStatus",
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

    // ...otherwise continue

    const data = { ...req.body };

    // Check if numberOfGuests is a number...

    if (
      data.numberOfGuests !== undefined &&
      typeof data.numberOfGuests !== "number"
    ) {
      // Otherwise, throw error

      return res.status(400).json({
        error: "numberOfGuests must be a number",
      });
    }

    // ...and the same for totalPrice

    if (data.totalPrice !== undefined && typeof data.totalPrice !== "number") {
      // Otherwise, throw error

      return res.status(400).json({
        error: "totalPrice must be a number",
      });
    }

    // Check if checkin date is valid

    if (data.checkinDate !== undefined) {
      const date = new Date(data.checkinDate);

      // If invalid, throw error

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          error: "Invalid checkinDate",
        });
      }

      // If valid, continue

      data.checkinDate = date;
    }

    // Check if checkin date is valid

    if (data.checkoutDate !== undefined) {
      const date = new Date(data.checkoutDate);

      // If invalid, throw error

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          error: "Invalid checkoutDate",
        });
      }

      // If valid, continue

      data.checkoutDate = date;
    }

    // If checkin/checkout dates not edited, restore existing dates

    const checkin = data.checkinDate ?? existingBooking.checkinDate;
    const checkout = data.checkoutDate ?? existingBooking.checkoutDate;

    // Check if checkout is AFTER checkin. Otherwise, throw error

    if (checkout <= checkin) {
      return res.status(400).json({
        error: "Checkout date must be after checkin date",
      });
    }

    const booking = await updateBooking(req.params.id, data);

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
});

// DELETE /bookings/:id
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const existingBooking = await getBookingById(req.params.id);

    // Check if booking exists, otherwise throw error

    if (!existingBooking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    await deleteBooking(req.params.id);

    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
