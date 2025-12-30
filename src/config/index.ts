import "dotenv/config";

const config = {
  port: process.env.PORT,
  connection_str: process.env.POSTGRESQL_CONNECTION,
};

export default config;
