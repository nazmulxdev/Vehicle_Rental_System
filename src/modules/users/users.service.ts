import { pool } from "../../config/db.config.js";

const getAllUsers = async () => {
  const result = await pool.query(
    ` SELECT id,name,email,phone,role FROM users`,
  );

  return result;
};

// const checkOwnerShip=async(requestedUser)=>{
//   const checkUserInDb=await pool.
// }

const deleteUser = async (userId: string) => {
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
};
