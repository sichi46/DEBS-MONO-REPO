import { Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { AuthenticatedRequest } from "../types/index.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";
import { prisma } from "../lib/prisma.js";

/**
 * Middleware to authenticate requests using JWT access token
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Access token required", 401);
      return;
    }
    
    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      sendError(res, "Invalid or expired access token", 401);
      return;
    }
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true, role: true },
    });
    
    if (!user) {
      sendError(res, "User not found", 401);
      return;
    }
    
    if (user.status !== "ACTIVE") {
      sendError(res, "Account is not active", 403);
      return;
    }
    
    req.user = payload;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    sendError(res, "Authentication failed", 500);
  }
}

/**
 * Middleware to require specific roles (RBAC)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      sendError(res, "Not authenticated", 401);
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, "Insufficient permissions", 403);
      return;
    }
    
    next();
  };
}

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Middleware to require admin or agent role
 */
export const requireStaff = requireRole(UserRole.ADMIN, UserRole.AGENT);
