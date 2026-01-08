import { NextFunction, Request, Response } from "express";
import sendResponse from "../utils/sendResponse.js";
import errorHandler from "../utils/errorHandler.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/index.js";

const auth = (...roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeaders = req.headers.authorization as string;

      const authToken = authHeaders?.split(" ")[1];

      if (!authToken) {
        throw new errorHandler(401, "Missing authentication token.");
      }

      const decoded = jwt.verify(
        authToken,
        config.jwt_secret as string,
      ) as JwtPayload;

      console.log(decoded);

      if (!decoded) {
        throw new errorHandler(401, "Invalid authentication token.");
      }

      if (roles.length && !roles.includes(decoded.role)) {
        throw new errorHandler(403, "Unauthorized access.");
      }

      req.user = decoded as JwtPayload;
      next();
    } catch (error: any) {
      sendResponse(res, {
        statusCode: error.statusCode || 500,
        success: false,
        message: error.message,
      });
    }
  };
};

export default auth;
