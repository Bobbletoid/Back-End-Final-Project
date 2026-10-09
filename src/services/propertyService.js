import { PrismaClient } from "@prisma/client";

// Helper functions for property routes

const prisma = new PrismaClient();

// GET all properties

export async function getProperties() {
  return prisma.property.findMany();
}

// GET property by ID

export async function getPropertyById(id) {
  return prisma.property.findUnique({
    where: { id },
  });
}

// GET property by location and/or price per night

export async function findProperties({ location, pricePerNight }) {
  const where = {};

  if (location !== undefined) {
    where.location = location;
  }

  if (pricePerNight !== undefined) {
    where.pricePerNight = pricePerNight;
  }

  return prisma.property.findMany({
    where,
  });
}
// CREATE new property

export async function createProperty(data) {
  return prisma.property.create({
    data,
  });
}

// UPDATE existing property

export async function updateProperty(id, data) {
  return prisma.property.update({
    where: { id },
    data,
  });
}

// DELETE property

export async function deleteProperty(id) {
  return prisma.property.delete({
    where: { id },
  });
}
