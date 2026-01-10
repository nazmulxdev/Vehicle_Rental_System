import { pool } from "../../config/db.config.js";
import errorHandler from "../../utils/errorHandler.js";

interface IBooking {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
  total_rented_day: number;
}

const createBooking = async (payload: IBooking) => {
  const {
    customer_id,
    vehicle_id,
    rent_start_date,
    rent_end_date,
    total_rented_day,
  } = payload;

  const checkUser = await pool.query(
    `
    SELECT * FROM Users WHERE id=$1
    `,
    [customer_id],
  );

  if (checkUser.rowCount === 0) {
    throw new errorHandler(404, "Customer is not registered in this id.");
  }

  const checkVehicleStatus = await pool.query(
    `
    SELECT * FROM Vehicles WHERE id=$1
    `,
    [vehicle_id],
  );

  if (checkVehicleStatus.rowCount === 0) {
    throw new errorHandler(404, "No vehicle found.");
  }

  const {
    vehicle_name,
    daily_rent_price,
    registration_number,
    availability_status,
  } = checkVehicleStatus.rows[0];

  if (availability_status === "booked") {
    throw new errorHandler(409, "The vehicle is already booked.");
  }

  const totalPrice = total_rented_day * daily_rent_price;

  const bookingVehicle = await pool.query(
    `
    INSERT INTO Bookings(customer_id,vehicle_id,rent_start_date,rent_end_date,total_price,status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `,
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      totalPrice,
      "active",
    ],
  );

  const updateVehicleStatus = await pool.query(
    `
    UPDATE Vehicles SET availability_status=$1 WHERE id=$2
    `,
    ["booked", vehicle_id],
  );

  if (updateVehicleStatus.rowCount === 0) {
    throw new errorHandler(500, "Failed to update vehicle status.");
  }
  return {
    ...bookingVehicle.rows[0],
    rent_start_date: bookingVehicle.rows[0].rent_start_date
      .toISOString()
      .split("T")[0],
    rent_end_date: bookingVehicle.rows[0].rent_end_date
      .toISOString()
      .split("T")[0],
    vehicle: { vehicle_name, registration_number, daily_rent_price },
  };
};

const getBookingsByRole = async (userId: string, role: string) => {
  if (role === "admin") {
    const result = await pool.query(
      `
       SELECT
        b.id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        u.name AS customer_name,
        u.email AS customer_email,
        u.phone,
        v.vehicle_name,
        v.registration_number,
        v.daily_rent_price
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id DESC

      `,
    );
    return result.rows;
  }
  if (role === "customer") {
    const result = await pool.query(
      `
      SELECT 
      b.id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      v.vehicle_name,
      v.registration_number,
      v.type,
      v.daily_rent_price
      FROM Bookings b 
      JOIN Vehicles v ON b.vehicle_id=v.id
      WHERE b.customer_id=$1
      ORDER BY b.id DESC
      `,
      [userId],
    );
    return result.rows;
  }
};

const autoReturnedBookings = async () => {
  const today = new Date();
  const expiredBookings = await pool.query(
    `
    SELECT id,vehicle_id FROM Bookings WHERE status=$1 AND rent_end_date<$2
    `,
    ["active", today],
  );
  if (expiredBookings.rowCount === 0) return;

  const bookingIds = expiredBookings.rows.map((bId) => bId.id);
  const vehicleIds = expiredBookings.rows.map((bId) => bId.vehicle_id);

  await pool.query(
    `
    UPDATE Bookings SET status=$1 WHERE id=ANY($2::int[])
    `,
    ["returned", bookingIds],
  );

  await pool.query(
    `
    UPDATE Vehicles SET availability_status =$1 WHERE id=ANY($2::int[])
    `,
    ["available", vehicleIds],
  );
};

const updateBooking = async (
  userId: string,
  bookingId: string | undefined,
  role: string,
  reqStatus: string,
) => {
  const getBookingDetails = await pool.query(
    `
      SELECT * FROM Bookings WHERE id=$1
      `,
    [bookingId],
  );

  if (getBookingDetails.rowCount === 0) {
    throw new errorHandler(404, "Booking not found.");
  }

  const { vehicle_id, status, customer_id, rent_start_date } =
    getBookingDetails.rows[0];

  if (role === "admin") {
    if (reqStatus !== "returned") {
      throw new errorHandler(400, "Please give valid status.");
    }

    if (status === "returned") {
      throw new errorHandler(400, "Booking is already returned.");
    }
    const updateBookingStatus = await pool.query(
      `
      UPDATE Bookings SET status=$1 WHERE id=$2 RETURNING *
      `,
      [reqStatus, bookingId],
    );
    const updateVehicleAvailability = await pool.query(
      `
      UPDATE Vehicles SET availability_status=$1 WHERE id=$2 RETURNING availability_status
      
      `,
      ["available", vehicle_id],
    );

    return {
      ...updateBookingStatus.rows[0],
      rent_start_date: updateBookingStatus.rows[0].rent_start_date
        .toISOString()
        .split("T")[0],
      rent_end_date: updateBookingStatus.rows[0].rent_end_date
        .toISOString()
        .split("T")[0],

      vehicle: updateVehicleAvailability.rows[0],
    };
  }
  if (role === "customer") {
    if (userId !== customer_id) {
      throw new errorHandler(403, "Unauthorized request.");
    }

    if (reqStatus !== "cancelled") {
      throw new errorHandler(
        400,
        "You can only cancelled the booking. Please give valid status.",
      );
    }

    if (status === "cancelled") {
      throw new errorHandler(400, "Booking is already cancelled.");
    }

    const today = new Date();
    const bookingStartDate = new Date(rent_start_date);

    if (today >= bookingStartDate) {
      throw new errorHandler(
        400,
        "Booking can not be cancelled after start date.",
      );
    }

    const result = await pool.query(
      `
      UPDATE Bookings SET status=$1 WHERE id=$2 RETURNING *
      `,
      [reqStatus, bookingId],
    );

    const updateVehicleAvailability = await pool.query(
      `
      UPDATE Vehicles SET availability_status=$1 WHERE id=$2 RETURNING availability_status
      
      `,
      ["available", vehicle_id],
    );

    return {
      ...result.rows[0],
      rent_start_date: result.rows[0].rent_start_date
        .toISOString()
        .split("T")[0],
      rent_end_date: result.rows[0].rent_end_date.toISOString().split("T")[0],
      vehicle: updateVehicleAvailability.rows[0],
    };
  }
};
export const bookingsServices = {
  createBooking,
  getBookingsByRole,
  updateBooking,
  autoReturnedBookings,
};
