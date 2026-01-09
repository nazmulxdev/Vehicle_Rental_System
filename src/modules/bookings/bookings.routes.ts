import { Router } from "express";
import { bookingsController } from "./bookings.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.post("/", auth("admin", "customer"), bookingsController.createBooking);

router.get(
  "/",
  auth("admin", "customer"),
  bookingsController.getBookingsByRole,
);

export const bookingsRoutes = router;
