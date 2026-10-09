import { PrismaClient } from "@prisma/client";

// Helper functions for user routes

const prisma = new PrismaClient();

// GET all users

export async function getUsers() {
  return prisma.user.findMany();
}

// GET user by ID

export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

// GET user by username

export async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
  });
}

// GET user by email

export async function findUserByEmail(email) {
  return prisma.user.findFirst({
    where: { email },
  });
}

// CREATE new user

export async function createUser(data) {
  return prisma.user.create({
    data,
  });
}

// UPDATE existing user

export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

// DELETE user

export async function deleteUser(id) {
  return prisma.user.delete({
    where: { id },
  });
}
