import { PrismaClient } from "@prisma/client";

// Helper functions for review routes

const prisma = new PrismaClient();

// GET all reviews

export async function getReviews() {
  return prisma.review.findMany();
}

// GET review by ID

export async function getReviewById(id) {
  return prisma.review.findUnique({
    where: { id },
  });
}

// CREATE new review

export async function createReview(data) {
  return prisma.review.create({
    data,
  });
}

// UPDATE existing review

export async function updateReview(id, data) {
  return prisma.review.update({
    where: { id },
    data,
  });
}

// DELETE review

export async function deleteReview(id) {
  return prisma.review.delete({
    where: { id },
  });
}
