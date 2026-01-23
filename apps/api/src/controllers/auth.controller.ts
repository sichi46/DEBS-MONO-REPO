import { Request, Response } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AuthenticatedRequest } from "../types/index.js";

// =============================================================================
// Validation Schemas
// =============================================================================

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// =============================================================================
// Controller Functions
// =============================================================================

export const authController = {
  /**
   * POST /auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      const result = await authService.register(validation.data);

      sendSuccess(res, result, "Registration successful", 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      sendError(res, message, 400);
    }
  },

  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      const result = await authService.login(validation.data);

      sendSuccess(res, result, "Login successful");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      sendError(res, message, 401);
    }
  },

  /**
   * POST /auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const validation = refreshTokenSchema.safeParse(req.body);

      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      const tokens = await authService.refreshToken(validation.data.refreshToken);

      sendSuccess(res, { tokens }, "Token refreshed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Token refresh failed";
      sendError(res, message, 401);
    }
  },

  /**
   * POST /auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const validation = refreshTokenSchema.safeParse(req.body);

      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      await authService.logout(validation.data.refreshToken);

      sendSuccess(res, null, "Logged out successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed";
      sendError(res, message, 400);
    }
  },

  /**
   * POST /auth/logout-all (requires authentication)
   */
  async logoutAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Not authenticated", 401);
        return;
      }

      await authService.logoutAll(req.user.userId);

      sendSuccess(res, null, "Logged out from all devices");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed";
      sendError(res, message, 400);
    }
  },

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const validation = forgotPasswordSchema.safeParse(req.body);

      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      const message = await authService.forgotPassword(validation.data.email);

      sendSuccess(res, null, message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      sendError(res, message, 400);
    }
  },

  /**
   * POST /auth/reset-password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);

      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      await authService.resetPassword(validation.data.token, validation.data.password);

      sendSuccess(res, null, "Password reset successful");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Password reset failed";
      sendError(res, message, 400);
    }
  },

  /**
   * POST /auth/change-password (requires authentication)
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Not authenticated", 401);
        return;
      }

      const validation = changePasswordSchema.safeParse(req.body);

      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      await authService.changePassword(
        req.user.userId,
        validation.data.currentPassword,
        validation.data.newPassword
      );

      sendSuccess(res, null, "Password changed successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Password change failed";
      sendError(res, message, 400);
    }
  },

  /**
   * GET /auth/me (requires authentication)
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Not authenticated", 401);
        return;
      }

      const user = await authService.getProfile(req.user.userId);

      sendSuccess(res, { user });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get profile";
      sendError(res, message, 400);
    }
  },

  /**
   * PATCH /auth/me (requires authentication)
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Not authenticated", 401);
        return;
      }

      const validation = updateProfileSchema.safeParse(req.body);

      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      const user = await authService.updateProfile(req.user.userId, validation.data);

      sendSuccess(res, { user }, "Profile updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      sendError(res, message, 400);
    }
  },
};
