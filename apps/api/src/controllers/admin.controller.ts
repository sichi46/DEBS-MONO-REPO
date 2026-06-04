import { Response } from "express";
import { z } from "zod";
import { adminService } from "../services/admin.service.js";
import { lencoService } from "../services/lenco.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AuthenticatedRequest } from "../types/index.js";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const adminController = {
  async getDashboardStats(_req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await adminService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (error: unknown) {
      console.error("Get dashboard stats error:", error);
      sendError(
        res,
        getErrorMessage(error, "Failed to fetch dashboard stats"),
        500,
      );
    }
  },

  async getMonthlyData(req: AuthenticatedRequest, res: Response) {
    try {
      const year = req.query.year
        ? parseInt(req.query.year as string, 10)
        : undefined;
      const data = await adminService.getMonthlyData(year);
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Get monthly data error:", error);
      sendError(
        res,
        getErrorMessage(error, "Failed to fetch monthly data"),
        500,
      );
    }
  },

  async getPolicyDistribution(_req: AuthenticatedRequest, res: Response) {
    try {
      const data = await adminService.getPolicyDistribution();
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Get policy distribution error:", error);
      sendError(
        res,
        getErrorMessage(error, "Failed to fetch policy distribution"),
        500,
      );
    }
  },

  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit, search, role, status } = req.query;
      const data = await adminService.getUsers({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        role: role as string,
        status: status as string,
      });
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Get users error:", error);
      sendError(res, getErrorMessage(error, "Failed to fetch users"), 500);
    }
  },

  async updateUserRole(req: AuthenticatedRequest, res: Response) {
    try {
      const schema = z.object({
        role: z.enum(["ADMIN", "AGENT", "USER"]),
      });
      const { role } = schema.parse(req.body);
      const userId = req.params.id as string;
      const user = await adminService.updateUserRole(
        userId,
        role,
        req.user!.userId,
      );
      sendSuccess(res, user, "User role updated");
    } catch (error: unknown) {
      console.error("Update user role error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid role value", 400);
        return;
      }
      sendError(res, getErrorMessage(error, "Failed to update user role"), 400);
    }
  },

  async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const schema = z.object({
        status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
      });
      const { status } = schema.parse(req.body);
      const userId = req.params.id as string;
      const user = await adminService.updateUserStatus(
        userId,
        status,
        req.user!.userId,
      );
      sendSuccess(res, user, "User status updated");
    } catch (error: unknown) {
      console.error("Update user status error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid status value", 400);
        return;
      }
      sendError(
        res,
        getErrorMessage(error, "Failed to update user status"),
        400,
      );
    }
  },

  async getPolicies(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit, status, search } = req.query;
      const data = await adminService.getAllPolicies({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as string,
        search: search as string,
      });
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Get admin policies error:", error);
      sendError(res, getErrorMessage(error, "Failed to fetch policies"), 500);
    }
  },

  async getClaims(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit, status, search } = req.query;
      const data = await adminService.getAllClaims({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as string,
        search: search as string,
      });
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Get admin claims error:", error);
      sendError(res, getErrorMessage(error, "Failed to fetch claims"), 500);
    }
  },

  async updateClaimStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const schema = z.object({
        status: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]),
      });
      const { status } = schema.parse(req.body);
      const claimId = req.params.id as string;
      const claim = await adminService.updateClaimStatus(
        claimId,
        status,
        req.user!.userId,
      );
      sendSuccess(res, claim, "Claim status updated");
    } catch (error: unknown) {
      console.error("Update claim status error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid claim status value", 400);
        return;
      }
      sendError(
        res,
        getErrorMessage(error, "Failed to update claim status"),
        400,
      );
    }
  },

  async getPayments(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit, status, search } = req.query;
      const data = await adminService.getAllPayments({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as string,
        search: search as string,
      });
      sendSuccess(res, data);
    } catch (error: unknown) {
      console.error("Get admin payments error:", error);
      sendError(res, getErrorMessage(error, "Failed to fetch payments"), 500);
    }
  },

  async reconcileLencoTransfers(req: AuthenticatedRequest, res: Response) {
    try {
      const olderThanMinutes = req.query.olderThanMinutes
        ? parseInt(req.query.olderThanMinutes as string, 10)
        : undefined;
      const batchSize = req.query.batchSize
        ? parseInt(req.query.batchSize as string, 10)
        : undefined;

      const result = await lencoService.reconcileStuckTransfers({
        olderThanMinutes,
        batchSize,
      });
      sendSuccess(res, result, "Reconciliation complete");
    } catch (error: unknown) {
      console.error("Lenco reconcile error:", error);
      sendError(res, getErrorMessage(error, "Reconciliation failed"), 500);
    }
  },
};
