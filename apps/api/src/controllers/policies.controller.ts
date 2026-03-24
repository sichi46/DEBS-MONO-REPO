import { Response } from "express";
import { z } from "zod";
import { policiesService } from "../services/policies.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AuthenticatedRequest } from "../types/index.js";

// =============================================================================
// Validation Schemas
// =============================================================================

const createPolicySchema = z.object({
  policyTypeId: z.string().min(1, "Policy Type is required"),
  coverageAmount: z.number().min(1, "Coverage amount must be positive"),
  premiumAmount: z.number().min(1, "Premium amount must be positive"),
  beneficiaries: z
    .array(
      z.object({
        name: z.string().min(2, "Name is required"),
        relationship: z.string().min(2, "Relationship is required"),
        percentage: z
          .number()
          .min(1)
          .max(100, "Percentage must be between 1 and 100"),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
      }),
    )
    .min(1, "At least one beneficiary is required")
    .refine(
      (data) => data.reduce((acc, curr) => acc + curr.percentage, 0) === 100,
      "Beneficiary percentages must total 100%",
    ),
});

const getPoliciesSchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  status: z.string().optional(),
  type: z.string().optional(),
});

// =============================================================================
// Controller Functions
// =============================================================================

export const policiesController = {
  /**
   * GET /policies
   * Get all policies for the authenticated user
   */
  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Not authenticated", 401);
        return;
      }

      const validation = getPoliciesSchema.safeParse(req.query);
      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      const result = await policiesService.getUserPolicies({
        userId: req.user.userId,
        ...validation.data,
      });

      sendSuccess(res, result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch policies";
      sendError(res, message, 500);
    }
  },

  /**
   * GET /policies/:id
   * Get a single policy by ID
   */
  async getOne(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Not authenticated", 401);
        return;
      }

      const id = req.params.id as string;
      const policy = await policiesService.getPolicyById(id, req.user.userId);

      if (!policy) {
        sendError(res, "Policy not found", 404);
        return;
      }

      sendSuccess(res, { policy });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch policy";
      sendError(res, message, 500);
    }
  },

  /**
   * POST /policies
   * Create a new policy
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Not authenticated", 401);
        return;
      }

      const validation = createPolicySchema.safeParse(req.body);
      if (!validation.success) {
        sendError(res, validation.error.errors[0].message, 400);
        return;
      }

      const policy = await policiesService.createPolicy({
        userId: req.user.userId,
        ...validation.data,
        paymentFrequency: "Monthly", // Default for now, can be added to schema later
      });

      sendSuccess(res, { policy }, "Policy created successfully", 201);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to create policy";
      sendError(res, message, 500);
    }
  },
};
