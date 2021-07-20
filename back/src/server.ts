import dotenv from "dotenv";
import app from "./app";
dotenv.config({
  path: `${__dirname}/../config.env`,
});

const PORT = process.env.PORT;

// Starting server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
