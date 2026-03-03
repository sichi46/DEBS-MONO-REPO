import { Router, type IRouter } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import {
  authLimiter,
  passwordResetLimiter,
  refreshLimiter,
} from "../middleware/rateLimit.js";

const router: IRouter = Router();

// =============================================================================
// Public Routes (No authentication required)
// =============================================================================

// POST /auth/register - Register a new user
router.post("/register", authLimiter, authController.register);

// POST /auth/login - Login user
router.post("/login", authLimiter, authController.login);

// POST /auth/refresh - Refresh access token
router.post("/refresh", refreshLimiter, authController.refresh);

// POST /auth/logout - Logout (invalidate refresh token)
router.post("/logout", authController.logout);

// POST /auth/forgot-password - Request password reset
router.post("/forgot-password", passwordResetLimiter, authController.forgotPassword);

// POST /auth/reset-password - Reset password with token
router.post("/reset-password", passwordResetLimiter, authController.resetPassword);

// =============================================================================
// Protected Routes (Authentication required)
// =============================================================================

// POST /auth/logout-all - Logout from all devices
router.post("/logout-all", authenticate, authController.logoutAll);

// POST /auth/change-password - Change password
router.post("/change-password", authenticate, authController.changePassword);

// GET /auth/me - Get current user profile
router.get("/me", authenticate, authController.getProfile);

// PATCH /auth/me - Update current user profile
router.patch("/me", authenticate, authController.updateProfile);

export default router;
