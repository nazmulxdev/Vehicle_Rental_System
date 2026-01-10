import bcrypt from "bcryptjs";
import { pool } from "../../config/db.config.js";
import errorHandler from "../../utils/errorHandler.js";

interface IUser {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: "admin" | "customer";
}

const getAllUsers = async () => {
  const result = await pool.query(
    ` SELECT id,name,email,phone,role FROM users`,
  );

  return result;
};

const checkOwnerShip = async (
  userId: string | undefined,
  email: string | undefined,
) => {
  if (!userId) {
    throw new errorHandler(400, "User id is required.");
  }

  const check = await pool.query(
    `
    SELECT id FROM Users WHERE id=$1 AND email=$2
    `,
    [userId, email],
  );

  return check.rowCount;
};

const updateUser = async (userId: string | undefined, payload: IUser) => {
  if (!userId) {
    throw new errorHandler(400, "User id is required.");
  }

  const updateDetailsKey = Object.keys(payload);

  if (updateDetailsKey.length === 0) {
    throw new errorHandler(400, "No fields provided to update");
  }

  const checkUser = await pool.query(
    `
    SELECT id FROM Users WHERE id=$1
    `,
    [userId],
  );

  if (checkUser.rowCount === 0) {
    throw new errorHandler(404, "User not found.");
  }

  if (payload.email) {
    const checkUniqueEmail = await pool.query(
      `
      SELECT id FROM Users WHERE email=$1 AND id!=$2
      `,
      [payload.email, userId],
    );

    if (checkUniqueEmail.rows.length > 0) {
      throw new errorHandler(400, "Email already exist.");
    }
  }

  if (payload.role) {
    if (payload.role !== "admin" && payload.role !== "customer") {
      throw new errorHandler(400, "Please give valid role.");
    }
  }

  if (payload.password) {
    if (payload.password.length < 6) {
      throw new errorHandler(400, "Password length must be 6 or above.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);
    payload.password = hashedPassword;
  }

  const updateDetailsValues = Object.values(payload);
  const queryKeys = updateDetailsKey
    .map((key, index) => `${key}=$${index + 1}`)
    .join(", ");

  const result = await pool.query(
    `
        UPDATE Users SET ${queryKeys} WHERE id=$${
      updateDetailsValues.length + 1
    } RETURNING *
        `,
    [...updateDetailsValues, userId],
  );

  return result.rows[0];
};

const deleteUser = async (userId: string | undefined) => {
  const checkUser = await pool.query(
    `
    SELECT id FROM Users WHERE id=$1
    `,
    [userId],
  );

  if (checkUser.rowCount === 0) {
    throw new errorHandler(404, "User not found.");
  }

  const checkUserBookings = await pool.query(
    `
    SELECT * FROM Bookings WHERE customer_id=$1 AND status=$2
    `,
    [userId, "active"],
  );

  if (checkUserBookings.rowCount! > 0) {
    throw new errorHandler(400, "Active bookings available of this user's.");
  }

  const result = await pool.query(
    `
    DELETE FROM users WHERE id=$1
    `,
    [userId],
  );
  return result;
};

export const userServices = {
  getAllUsers,
  deleteUser,
  updateUser,
  checkOwnerShip,
};
