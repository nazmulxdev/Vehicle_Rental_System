import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import errorHandler from "../../utils/errorHandler.js";
import { bookingsServices } from "./bookings.service.js";
import { JwtPayload } from "jsonwebtoken";

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

const getBookingsByRole = async (req: Request, res: Response) => {
  const authUser = req.user as JwtPayload;

  try {
    if (authUser.role === "admin") {
      const result = await bookingsServices.getBookingsByRole(
        authUser.id,
        authUser.role,
      );

      const formattedResponse = result?.map((b) => ({
        id: b.id,
        customer_id: b.customer_id,
        vehicle_id: b.vehicle_id,
        rent_start_date: b.rent_start_date.toISOString().split("T")[0],
        rent_end_date: b.rent_end_date.toISOString().split("T")[0],
        total_price: b.total_price,
        status: b.status,
        customer: {
          name: b.customer_name,
          email: b.customer_email,
          phone: b.phone,
        },
        vehicle: {
          vehicle_name: b.vehicle_name,
          registration_number: b.registration_number,
          daily_rent_price: b.daily_rent_price,
        },
      }));

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Booking retrieves successfully.",
        data: formattedResponse,
      });
    }

    if (authUser.role === "customer") {
      const result = await bookingsServices.getBookingsByRole(
        authUser.id,
        authUser.role,
      );

      const formattedResponse = result?.map((b) => ({
        id: b.id,
        vehicle_id: b.vehicle_id,
        rent_start_date: b.rent_start_date.toISOString().split("T")[0],
        rent_end_date: b.rent_end_date.toISOString().split("T")[0],
        total_price: b.total_price,
        status: b.status,
        vehicle: {
          vehicle_name: b.vehicle_name,
          registration_number: b.registration_number,
          type: b.type,
          daily_rent_price: b.daily_rent_price,
        },
      }));

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Your bookings retrieved successfully.",
        data: formattedResponse,
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message,
    });
  }
};

const updateBookingStatus = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const { id, role } = req.user as JwtPayload;
  try {
    await bookingsServices.autoReturnedBookings();
    if (role === "admin") {
      const result = await bookingsServices.updateBooking(
        id,
        bookingId,
        role,
        status,
      );

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Booking marked as returned. Vehicle is now available.",
        data: result,
      });
    }

    if (role === "customer") {
      const result = await bookingsServices.updateBooking(
        id,
        bookingId,
        role,
        status,
      );

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Booking cancelled successfully.",
        data: result,
      });
    }
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
  getBookingsByRole,
  updateBookingStatus,
};
