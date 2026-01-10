import { pool } from "../../config/db.config.js";
import errorHandler from "../../utils/errorHandler.js";

interface IVehicle {
  vehicle_name: string;
  type: "car" | "bike" | "van" | "SUV";
  registration_number: string;
  daily_rent_price: number;
  availability_status: "available" | "booked";
}

interface IOptional {
  vehicle_name?: string;
  type?: "car" | "bike" | "van" | "SUV";
  registration_number?: string;
  daily_rent_price?: number;
  availability_status?: "available" | "booked";
}

const createVehicle = async (payload: IVehicle) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;
  const checkRegistration = await pool.query(
    `
        SELECT * FROM Vehicles WHERE registration_number=$1
        `,
    [registration_number],
  );

  if (checkRegistration.rows.length > 0) {
    throw new errorHandler(
      400,
      "Vehicle already registered using this registration number.",
    );
  }

  const result = await pool.query(
    `
    INSERT INTO Vehicles(vehicle_name,type,registration_number,daily_rent_price,availability_status) VALUES ($1,$2,$3,$4,$5) RETURNING *
    `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ],
  );
  return result;
};

const getAllVehicles = async () => {
  const result = await pool.query(
    `
    SELECT * FROM Vehicles 
        `,
  );

  return result;
};

const getVehicleById = async (vehicleId: string) => {
  const result = await pool.query(
    `
        SELECT * FROM Vehicles WHERE id=$1
        `,
    [vehicleId],
  );
  return result;
};

const updateVehicle = async (
  vehicleId: string | undefined,
  payload: IOptional,
) => {
  if (!vehicleId) {
    throw new errorHandler(400, "Vehicle Id is required.");
  }

  const updateDetailsKey = Object.keys(payload);
  if (updateDetailsKey.length === 0) {
    throw new errorHandler(400, "No fields provided to update.");
  }

  const checkVehicle = await pool.query(
    `
    SELECT id FROM Vehicles WHERE id=$1
    `,
    [vehicleId],
  );

  if (checkVehicle.rowCount === 0) {
    throw new errorHandler(404, "Vehicle not found.");
  }

  if (payload.type) {
    if (
      payload.type !== "car" &&
      payload.type !== "bike" &&
      payload.type !== "van" &&
      payload.type !== "SUV"
    ) {
      throw new errorHandler(
        400,
        "Vehicle type must be in car, van, bike or SUV. ",
      );
    }
  }
  if (payload.availability_status) {
    if (
      payload.availability_status !== "available" &&
      payload.availability_status !== "booked"
    ) {
      throw new errorHandler(400, "Invalid availability status. ");
    }
  }

  if (payload.registration_number) {
    const checkRegistration = await pool.query(
      `
      SELECT id FROM Vehicles WHERE registration_number=$1 
      `,
      [payload.registration_number],
    );

    if (checkRegistration.rowCount !== 0) {
      throw new errorHandler(400, "Already used this registration number.");
    }
  }

  if (payload.daily_rent_price !== undefined && payload.daily_rent_price < 0) {
    throw new errorHandler(400, "Daily rent price can not be negative.");
  }

  const setKeys = updateDetailsKey
    .map((key, index) => `${key}=$${index + 1}`)
    .join(", ");

  const setValues = Object.values(payload);
  const result = await pool.query(
    `
    UPDATE Vehicles SET ${setKeys} WHERE id =$${
      setValues.length + 1
    } RETURNING *
    `,
    [...setValues, vehicleId],
  );

  return result.rows[0];
};

const deleteVehicle = async (vehicleId: string) => {
  const checkVehicleExist = await pool.query(
    `
    SELECT id FROM Vehicles WHERE id=$1
    `,
    [vehicleId],
  );

  if (checkVehicleExist.rowCount === 0) {
    throw new errorHandler(404, "Vehicle not found");
  }
  const checkActiveBooking = await pool.query(
    `
    SELECT id FROM Bookings WHERE vehicle_id=$1 AND status=$2
    `,
    [vehicleId, "active"],
  );

  if (checkActiveBooking.rowCount! > 0) {
    throw new errorHandler(400, "Active bookings exist on this vehicle.");
  }

  const deleteVehicle = await pool.query(
    `
    DELETE FROM Vehicles WHERE id=$1
    `,
    [vehicleId],
  );
  return deleteVehicle;
};

export const vehiclesServices = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
