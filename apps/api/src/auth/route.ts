import { Router, type Router as RouterType } from "express";
import { authController } from "./controller.js";

const router: RouterType = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;

