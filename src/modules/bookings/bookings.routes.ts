import { Router } from "express";
import { bookingsController } from "./bookings.controller.js";

const router = Router();

router.post("/", bookingsController.createBooking);

export const bookingsRoutes = router;
