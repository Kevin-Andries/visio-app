import dotenv from "dotenv";
dotenv.config({
  path: `${__dirname}/../config.env`,
});
import server from "./app";

const PORT = process.env.PORT;

// Starting server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
