import { Pool } from "pg";
import config from "./index.js";

export const pool = new Pool({
  connectionString: `${config.connection_str}`,
});

const dbInit = async () => {
  await pool.query(
    `
        CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        name VARCHAR (250) NOT NULL,
        email TEXT NOT NULL UNIQUE CHECK (email=LOWER(email)),
        password VARCHAR (250) NOT NULL CHECK (LENGTH(password)>=6),
        phone VARCHAR (15) NOT NULL,
        role VARCHAR (100) NOT NULL CHECK (role IN ('admin','customer')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `,
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_name TEXT NOT NULL,
    type VARCHAR (250) NOT NULL CHECK (type IN ('car','bike','van','SUV')),
    registration_number VARCHAR(500) NOT NULL UNIQUE,
    daily_rent_price NUMERIC(15,2) NOT NULL CHECK(daily_rent_price>=0),
    availability_status VARCHAR(100) NOT NULL CHECK (availability_status IN ('available','booked'))
    )
    `);

  await pool.query(
    ` 
      CREATE TABLE IF NOT EXISTS Bookings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
      vehicle_id INTEGER REFERENCES Vehicles(id) ON DELETE CASCADE,
      rent_start_date DATE NOT NULL,
      rent_end_date DATE NOT NULL CHECK (rent_end_date>rent_start_date),
      total_price NUMERIC(15,2) NOT NULL CHECK (total_price>=0),
      status VARCHAR(100) NOT NULL CHECK (status IN ('active','cancelled','returned'))
      )
      `,
  );
};

export default dbInit;
