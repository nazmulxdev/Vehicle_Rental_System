import { Router } from "express";
import { vehiclesController } from "./vehicles.controller.js";

const router = Router();

router.post("/", vehiclesController.createVehicle);

export const vehiclesRoutes = router;
