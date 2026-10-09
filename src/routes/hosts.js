import express from "express";
import {
  // All the helper functions from hostService
  getHosts,
  getHostById,
  findHostByName,
  createHost,
  updateHost,
  deleteHost,
} from "../services/hostService.js";
// Authentication for POST, PUT, DELETE
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /hosts
// GET /hosts?name=...
router.get("/", async (req, res, next) => {
  try {
    const { name } = req.query;
    console.log("HOST SEARCH:", JSON.stringify(name));

    if (name) {
      const host = await findHostByName(name);

      if (!host) {
        return res.status(404).json({
          error: "Host not found",
        });
      }

      // Show host information without password

      const { password, ...hostWithoutPassword } = host;

      return res.status(200).json(hostWithoutPassword);
    }

    const hosts = await getHosts();

    const hostsWithoutPasswords = hosts.map(({ password, ...host }) => host);

    res.status(200).json(hostsWithoutPasswords);
  } catch (error) {
    next(error);
  }
});

// POST /hosts
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    // Decide which data needs to be provided
    const {
      username,
      password,
      name,
      email,
      phoneNumber,
      pictureUrl,
      aboutMe,
    } = req.body;

    // Check if all fields have valid information

    if (
      !username ||
      !password ||
      !name ||
      !email ||
      !phoneNumber ||
      !pictureUrl ||
      !aboutMe
    ) {
      return res.status(400).json({
        error: "Missing required host information",
      });
    }

    const host = await createHost(req.body);

    const { password: _, ...hostWithoutPassword } = host;

    res.status(201).json(hostWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// GET /hosts/:id
router.get("/:id", async (req, res, next) => {
  try {
    const host = await getHostById(req.params.id);

    // Check if host exists

    if (!host) {
      return res.status(404).json({
        error: "Host not found",
      });
    }

    const { password, ...hostWithoutPassword } = host;

    res.status(200).json(hostWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// PUT /hosts/:id
router.put("/:id", authenticateToken, async (req, res, next) => {
  // First make sure that there is information to update

  try {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({
        error: "Request body cannot be empty",
      });
    }

    // Check if the host you're trying to update exists

    const existingHost = await getHostById(req.params.id);

    if (!existingHost) {
      return res.status(404).json({
        error: "Host not found",
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
      "aboutMe",
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

    const host = await updateHost(req.params.id, req.body);

    const { password, ...hostWithoutPassword } = host;

    res.status(200).json(hostWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// DELETE /hosts/:id
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const existingHost = await getHostById(req.params.id);

    // Check if host exists, otherwise throw error

    if (!existingHost) {
      return res.status(404).json({
        error: "Host not found",
      });
    }

    await deleteHost(req.params.id);

    res.status(200).json({
      message: "Host deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
