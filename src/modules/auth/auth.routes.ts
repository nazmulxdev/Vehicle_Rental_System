import { Router } from "express";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/signup", authController.signupUser);
router.post("/signin", authController.signinUser);

export const authRoutes = router;
