import express from "express";
import cors from "cors";
import morgan from "morgan";
// Routers
import roomRouter from "./routers/roomRouter";
const app = express();

// Middlewares
app.use(cors({ origin: "http://localhost:3000" }));
app.use(morgan("tiny"));
app.use(express.json());

// Routers
app.use("/room", roomRouter);

// Handling unknown routes
app.all("*", (_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

export default app;
