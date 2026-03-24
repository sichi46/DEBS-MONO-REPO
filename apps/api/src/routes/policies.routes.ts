import { Router, type IRouter } from "express";
import { policiesController } from "../controllers/policies.controller.js";
import { authenticate } from "../middleware/auth.js";

const router: IRouter = Router();

// Retrieve all policies
router.get("/", authenticate, policiesController.getAll);

// Setup new policy
router.post("/", authenticate, policiesController.create);

// Retrieve a single policy by id
router.get("/:id", authenticate, policiesController.getOne);

export default router;
