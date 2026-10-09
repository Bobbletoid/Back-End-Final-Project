import { PrismaClient } from "@prisma/client";

// Helper functions for Booking routes

const prisma = new PrismaClient();

// GET all bookings

export async function getBookings() {
  return prisma.booking.findMany();
}

// GET bookings by ID

export async function getBookingById(id) {
  return prisma.booking.findUnique({
    where: { id },
  });
}

// GET bookings by user ID

export async function getBookingsByUserId(userId) {
  return prisma.booking.findMany({
    where: { userId },
  });
}

// CREATE new booking

export async function createBooking(data) {
  return prisma.booking.create({
    data,
  });
}

// UPDATE existing booking

export async function updateBooking(id, data) {
  return prisma.booking.update({
    where: { id },
    data,
  });
}

// DELETE booking

export async function deleteBooking(id) {
  return prisma.booking.delete({
    where: { id },
  });
}
