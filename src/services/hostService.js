import { PrismaClient } from "@prisma/client";

// Helper functions for host routes

const prisma = new PrismaClient();

// GET all hosts

export async function getHosts() {
  return prisma.host.findMany();
}

// GET host by ID

export async function getHostById(id) {
  return prisma.host.findUnique({
    where: { id },
  });
}

// GET host by name

export async function findHostByName(name) {
  return prisma.host.findFirst({
    where: { name },
  });
}

// CREATE new host

export async function createHost(data) {
  return prisma.host.create({
    data,
  });
}

// UPDATE existing host

export async function updateHost(id, data) {
  return prisma.host.update({
    where: { id },
    data,
  });
}

// DELETE host

export async function deleteHost(id) {
  return prisma.host.delete({
    where: { id },
  });
}
