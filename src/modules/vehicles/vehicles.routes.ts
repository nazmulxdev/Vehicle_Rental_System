import { Router } from "express";
import { vehiclesController } from "./vehicles.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.post("/", vehiclesController.createVehicle);
router.get("/", vehiclesController.getAllVehicles);
router.get("/:vehicleId", vehiclesController.getVehiclesById);

router.put("/:vehicleId", auth("admin"), vehiclesController.updateVehicle);
router.delete("/:vehicleId", auth("admin"), vehiclesController.deleteVehicle);
export const vehiclesRoutes = router;
