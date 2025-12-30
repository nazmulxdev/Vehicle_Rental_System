import app from "./app.js";

import config from "./config/index.js";

const port = config.port || 5000;

app.listen(port, () => {
  console.log("This server is running on the port :", port);
});
