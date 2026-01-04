import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import bcrypt from "bcryptjs";
import { authServices } from "./auth.service.js";
import errorHandler from "../../utils/errorHandler.js";

const signupUser = async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  try {
    if (!name || !email || !password || !phone || !role) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Insufficient user's details.",
      });
    }

    if (password.length < 6) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Password length must be 6 character or above.",
      });
    }

    const result = await authServices.createUser({
      name,
      email,
      password,
      role,
      phone,
    });

    console.log(result.rows[0]);

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully.",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const signinUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      throw new errorHandler(400, "Please input email.");
    }
    if (!password) {
      throw new errorHandler(400, "Please input password.");
    }
    const result = await authServices.signinUser({ email, password });
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful.",
      data: {
        token: result.token,
        user: result.loggedUser,
      },
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message,
    });
  }
};

export const authController = {
  signupUser,
  signinUser,
};
