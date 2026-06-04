import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router: Router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get("/stats", adminController.getDashboardStats);
router.get("/stats/monthly", adminController.getMonthlyData);
router.get("/stats/policy-distribution", adminController.getPolicyDistribution);

// User management
router.get("/users", adminController.getUsers);
router.patch("/users/:id/role", adminController.updateUserRole);
router.patch("/users/:id/status", adminController.updateUserStatus);

// Policies (admin view)
router.get("/policies", adminController.getPolicies);

// Claims management
router.get("/claims", adminController.getClaims);
router.patch("/claims/:id/status", adminController.updateClaimStatus);

// Payments
router.get("/payments", adminController.getPayments);

// Lenco reconciliation (manual trigger)
router.post("/lenco/reconcile", adminController.reconcileLencoTransfers);

export default router;
