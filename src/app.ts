import express, { Request, Response } from "express";
import dbInit from "./config/db.config.js";
import { usersRoutes } from "./modules/users/users.routes.js";

const app = express();

app.use(express.json());

// initialize to the connection with db
dbInit();

// users routes
app.use("/api/v1/users", usersRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("This is the assignment server.");
});

export default app;
