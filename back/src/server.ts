import dotenv from "dotenv";
import server from "./app";

dotenv.config({
  path: `${__dirname}/../config.env`,
});

const PORT = process.env.PORT;

// Starting server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
