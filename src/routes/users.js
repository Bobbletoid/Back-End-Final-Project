import express from "express";
import {
  // All the helper functions from userService
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findUserByUsername,
  findUserByEmail,
} from "../services/userService.js";
// Authentication for POST, PUT, DELETE
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET all users
// GET /users?username=...
// GET /users?email=...
// GET /users?username=...&email=...
router.get("/", async (req, res, next) => {
  try {
    // Check whether username and/or email are queried
    const { username, email } = req.query;

    // If username is queried, execute function findUserByUsername...
    if (username) {
      const user = await findUserByUsername(username);

      // ...and throw error if not found
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Otherwise, show found user without password
      const { password, ...userWithoutPassword } = user;

      return res.status(200).json(userWithoutPassword);
    }

    // If email is queried, execute function findUserByEmail...
    if (email) {
      const user = await findUserByEmail(email);

      // ...and throw error if not found
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Otherwise, show found user without password
      const { password, ...userWithoutPassword } = user;

      return res.status(200).json(userWithoutPassword);
    }

    // If no username or email queried, get all users
    const users = await getUsers();

    // Show found users without password
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.status(200).json(usersWithoutPasswords);
  } catch (error) {
    next(error);
  }
});

// POST /users
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    // Decide which data needs to be provided
    const { username, password, name, email, phoneNumber, pictureUrl } =
      req.body;

    // Check if all fields have valid information

    if (
      !username ||
      !password ||
      !name ||
      !email ||
      !phoneNumber ||
      !pictureUrl
    ) {
      return res.status(400).json({
        error: "Missing required user information",
      });
    }

    const user = await createUser(req.body);

    const { password: _, ...userWithoutPassword } = user;

    // Show user information without password

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// GET /users/:id
router.get("/:id", async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);

    // Check if user exists

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Show user information without password

    const { password, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// PUT /users/:id
router.put("/:id", authenticateToken, async (req, res, next) => {
  // First make sure that there is information to update

  try {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({
        error: "Request body cannot be empty",
      });
    }

    // Check if the user you're trying to update exists

    const existingUser = await getUserById(req.params.id);

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Declare valid fields

    const allowedFields = [
      "username",
      "password",
      "name",
      "email",
      "phoneNumber",
      "pictureUrl",
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

    // Otherwise, continue

    const user = await updateUser(req.params.id, req.body);

    // Show user information without password

    const { password, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// DELETE /users/:id
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const existingUser = await getUserById(req.params.id);

    // Check if user exists, otherwise throw error

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    await deleteUser(req.params.id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
