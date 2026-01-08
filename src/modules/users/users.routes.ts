import { Router } from "express";
import { userController } from "./users.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.get("/", auth("admin"), userController.getAllUsers);

router.put("/:userId", auth("admin", "customer"), userController.updateUser);

router.delete("/:userId", auth("admin"), userController.deleteUser);
export const usersRoutes = router;
