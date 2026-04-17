import express from "express";
import {
  login,
  logout,
  registerUser,
  getAllUsers,
} from "../Controller/userController.js";
import { verifyEmail } from "../Controller/verifyContoller.js";
import { loginLimiter } from "../Middleware/ratelimiter.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginLimiter, login);
router.get("/verify-email", verifyEmail);
router.get("/users", protect, getAllUsers);
router.post("/logout", logout);

export default router;
