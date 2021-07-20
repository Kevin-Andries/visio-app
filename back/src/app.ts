import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(cors({ origin: "localhost:3001" }));
app.use(morgan("tiny"));
app.use(express.json());

// Handling unknown routes
app.all("*", (_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

export default app;
