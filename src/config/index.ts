import "dotenv/config";

const config = {
  port: process.env.PORT,
  connection_str: process.env.POSTGRESQL_CONNECTION,
  jwt_secret: process.env.JWT_SECRET,
};

export default config;
