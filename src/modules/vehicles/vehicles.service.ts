import { pool } from "../../config/db.config.js";
import errorHandler from "../../utils/errorHandler.js";

interface IVehicle {
  vehicle_name: string;
  type: "car" | "bike" | "van" | "SUV";
  registration_number: string;
  daily_rent_price: number;
  availability_status: "available" | "booked";
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

export const vehiclesServices = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
};
