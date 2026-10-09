import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res, next) => {
  // Log in with username and password

  try {
    const { username, password } = req.body;

    // Check that username and password are provided

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    // Check if user exists

    const user = await prisma.user.findUnique({
      where: { username },
    });

    // Check if username and/or password are correct

    if (!user || user.password !== password) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    // Provide an authentication token

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // Check if successful

    res.status(200).json({
      token,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
