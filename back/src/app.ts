import http from "http";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
// Routers
import roomRouter from "./routers/roomRouter";
// Misc
import globalErrorHandler from "./controllers/errorController";

const IS_PROD = process.env.NODE_ENV === "development" ? false : true;

const app = express();
export const server = http.createServer(app);
// We need to require the socketController here to register the socket server before we export it
require("./controllers/socketController");

// Middlewares
app.use(morgan(IS_PROD ? "tiny" : "dev"));
app.use(express.json({ limit: "5kb" }));
app.use(cors({ origin: IS_PROD ? "https://confident-chandrasekhar-8d050a.netlify.app/" : "*" }));
app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  max: 60, // one per second max
  windowMs: 60 * 1000, // one minute
  message: "Too many requests",
});
app.use(limiter);

// Routers
app.use("/room", roomRouter);

// Handles unknown routes
app.all("*", (_, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Handles all app errors
app.use(globalErrorHandler);

export default server;
