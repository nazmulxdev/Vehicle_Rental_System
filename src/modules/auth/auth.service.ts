import bcrypt from "bcryptjs";
import { pool } from "../../config/db.config.js";
import jwt from "jsonwebtoken";
import errorHandler from "../../utils/errorHandler.js";
import config from "../../config/index.js";

interface ISignup {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "customer";
}

interface ISignin {
  email: string;
  password: string;
}

const createUser = async (payload: ISignup) => {
  const { name, email, phone, password, role } = payload;
  const checkUser = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  if (checkUser.rows.length > 0) {
    throw new errorHandler(400, "User already exist in database.");
  }
  if (role !== "admin" && role !== "customer") {
    throw new errorHandler(400, "Role must be either admin or customer.");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const result = await pool.query(
    `
        INSERT INTO users (name,email,phone,password,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,phone,role
        `,
    [name, email, phone, hashedPassword, role],
  );
  return result;
};

const signinUser = async (payload: ISignin) => {
  const { email, password } = payload;
  const getUserByEmail = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email],
  );

  if (getUserByEmail.rows.length === 0) {
    throw new errorHandler(404, "User not found");
  }

  const user = getUserByEmail.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new errorHandler(401, "Invalid password.");
  }

  const loggedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  const token = jwt.sign(loggedUser, config.jwt_secret as string, {
    expiresIn: "7d",
  });

  return { token, loggedUser };
};
export const authServices = {
  createUser,
  signinUser,
};
