import http from "http";

import express from "express";
import cors from "cors";
import morgan from "morgan";
// Routers
import roomRouter from "./routers/roomRouter";

//import PgQuery from "./db/pg";

// TODO: add security

const app = express();
export const server = http.createServer(app);
// We need to require the socketController here to register the socket server before we export it
require("./controllers/socketController");

// Middlewares
app.use(cors({ origin: "*" }));
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

export default server;
