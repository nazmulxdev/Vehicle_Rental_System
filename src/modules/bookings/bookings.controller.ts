import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import errorHandler from "../../utils/errorHandler.js";
import { bookingsServices } from "./bookings.service.js";

const createBooking = async (req: Request, res: Response) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;
  try {
    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
      throw new errorHandler(
        400,
        "Insufficient booking details to book the vehicle",
      );
    }

    const start_date = new Date(rent_start_date);
    const end_date = new Date(rent_end_date);

    if (isNaN(start_date.getTime()) || isNaN(end_date.getTime())) {
      throw new errorHandler(400, "Invalid date format.");
    }

    if (end_date < start_date) {
      throw new errorHandler(400, "End date must be after start date");
    }

    const timeInOneDay = 1000 * 60 * 60 * 24;
    const total_rented_day =
      (end_date.getTime() - start_date.getTime()) / timeInOneDay + 1;
    console.log({ total_rented_day });
    const result = await bookingsServices.createBooking({
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_rented_day,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking created successfully.",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message,
    });
  }
};

export const bookingsController = {
  createBooking,
};
