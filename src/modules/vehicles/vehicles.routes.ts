import { Router } from "express";
import { vehiclesController } from "./vehicles.controller.js";

const router = Router();

router.post("/", vehiclesController.createVehicle);
router.get("/", vehiclesController.getAllVehicles);
router.get("/:vehicleId", vehiclesController.getVehiclesById);
export const vehiclesRoutes = router;
