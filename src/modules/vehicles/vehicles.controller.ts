import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import errorHandler from "../../utils/errorHandler.js";
import { vehiclesServices } from "./vehicles.service.js";

const createVehicle = async (req: Request, res: Response) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;
  try {
    if (
      !vehicle_name ||
      !type ||
      !registration_number ||
      !daily_rent_price ||
      !availability_status
    ) {
      throw new errorHandler(
        400,
        "Insufficient vehicle's details to registration.",
      );
    }

    if (type !== "car" && type !== "bike" && type !== "van" && type !== "SUV") {
      throw new errorHandler(
        400,
        "Vehicle type must be in car, van, bike or SUV. ",
      );
    }

    if (daily_rent_price < 0) {
      throw new errorHandler(400, "Daily rent price can not be negative.");
    }

    if (
      availability_status !== "available" &&
      availability_status !== "booked"
    ) {
      throw new errorHandler(
        400,
        "Availability status must be either available or booked.",
      );
    }

    const result = await vehiclesServices.createVehicle({
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Vehicle created successfully.",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehiclesServices.getAllVehicles();
    if (result.rows.length === 0) {
      return sendResponse(res, {
        success: true,
        message: "No vehicles found.",
        statusCode: 200,
      });
    } else {
      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Vehicles retrieved successfully.",
        data: result.rows,
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

const getVehiclesById = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  try {
    if (!vehicleId) {
      throw new errorHandler(400, "Please give vehicle id.");
    }
    const result = await vehiclesServices.getVehicleById(vehicleId);
    if (result.rows.length === 0) {
      throw new errorHandler(404, "No vehicle listed using this id.");
    }
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Vehicle retrieved successfully.",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message,
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  try {
    if (!vehicleId) {
      throw new errorHandler(400, "Please give vehicle id.");
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message,
    });
  }
};

export const vehiclesController = {
  createVehicle,
  getAllVehicles,
  getVehiclesById,
};
