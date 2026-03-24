import { Response } from "express";
import { z } from "zod";
import { adminService } from "../services/admin.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AuthenticatedRequest } from "../types/index.js";

export const adminController = {
  async getDashboardStats(_req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await adminService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (error: any) {
      console.error("Get dashboard stats error:", error);
      sendError(res, error.message || "Failed to fetch dashboard stats", 500);
    }
  },

  async getMonthlyData(req: AuthenticatedRequest, res: Response) {
    try {
      const year = req.query.year
        ? parseInt(req.query.year as string, 10)
        : undefined;
      const data = await adminService.getMonthlyData(year);
      sendSuccess(res, data);
    } catch (error: any) {
      console.error("Get monthly data error:", error);
      sendError(res, error.message || "Failed to fetch monthly data", 500);
    }
  },

  async getPolicyDistribution(_req: AuthenticatedRequest, res: Response) {
    try {
      const data = await adminService.getPolicyDistribution();
      sendSuccess(res, data);
    } catch (error: any) {
      console.error("Get policy distribution error:", error);
      sendError(
        res,
        error.message || "Failed to fetch policy distribution",
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
    } catch (error: any) {
      console.error("Get users error:", error);
      sendError(res, error.message || "Failed to fetch users", 500);
    }
  },

  async updateUserRole(req: AuthenticatedRequest, res: Response) {
    try {
      const schema = z.object({
        role: z.enum(["ADMIN", "AGENT", "USER"]),
      });
      const { role } = schema.parse(req.body);
      const user = await adminService.updateUserRole(
        req.params.id,
        role,
        req.user!.userId,
      );
      sendSuccess(res, user, "User role updated");
    } catch (error: any) {
      console.error("Update user role error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid role value", 400);
        return;
      }
      sendError(res, error.message || "Failed to update user role", 400);
    }
  },

  async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const schema = z.object({
        status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
      });
      const { status } = schema.parse(req.body);
      const user = await adminService.updateUserStatus(
        req.params.id,
        status,
        req.user!.userId,
      );
      sendSuccess(res, user, "User status updated");
    } catch (error: any) {
      console.error("Update user status error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid status value", 400);
        return;
      }
      sendError(res, error.message || "Failed to update user status", 400);
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
    } catch (error: any) {
      console.error("Get admin policies error:", error);
      sendError(res, error.message || "Failed to fetch policies", 500);
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
    } catch (error: any) {
      console.error("Get admin claims error:", error);
      sendError(res, error.message || "Failed to fetch claims", 500);
    }
  },

  async updateClaimStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const schema = z.object({
        status: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]),
      });
      const { status } = schema.parse(req.body);
      const claim = await adminService.updateClaimStatus(
        req.params.id,
        status,
        req.user!.userId,
      );
      sendSuccess(res, claim, "Claim status updated");
    } catch (error: any) {
      console.error("Update claim status error:", error);
      if (error instanceof z.ZodError) {
        sendError(res, "Invalid claim status value", 400);
        return;
      }
      sendError(res, error.message || "Failed to update claim status", 400);
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
    } catch (error: any) {
      console.error("Get admin payments error:", error);
      sendError(res, error.message || "Failed to fetch payments", 500);
    }
  },
};
