import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import { userServices } from "./users.service.js";
import { JwtPayload } from "jsonwebtoken";
import errorHandler from "../../utils/errorHandler.js";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getAllUsers();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Users retrieved successfully.",
      data: result.rows,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: error.statusCode,
      message: error.message,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const requestedUser = req.user as JwtPayload;

  try {
    console.log(userId);
    console.log(requestedUser);

    if (requestedUser.role === "admin") {
      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "User updated successfully. This user is admin.",
        data: {},
      });
    }

    if (requestedUser.role === "customer") {
      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "User updated successfully. This user is customer.",
        data: {},
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode,
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const result = await userServices.deleteUser(userId!);
    if (result.rowCount === 0) {
      throw new errorHandler(404, "User not found in the database.");
    } else {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User delete successfully.",
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message,
    });
  }
};

export const userController = {
  getAllUsers,
  updateUser,
  deleteUser,
};
