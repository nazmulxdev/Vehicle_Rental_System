import express, { Request, Response } from "express";
import dbInit from "./config/db.config.js";
import { usersRoutes } from "./modules/users/users.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { vehiclesRoutes } from "./modules/vehicles/vehicles.routes.js";

const app = express();

app.use(express.json());

// initialize to the connection with db
dbInit();

// auth routes
app.use("/api/v1/auth", authRoutes);

// users routes
app.use("/api/v1/users", usersRoutes);

// vehicles routes
app.use("/api/v1/vehicles", vehiclesRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("This is the assignment server.");
});

export default app;
