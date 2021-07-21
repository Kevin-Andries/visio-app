import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Routers
import roomRouter from "./routers/roomRouter";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected to socket " + socket.id);
});

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

export default server;
