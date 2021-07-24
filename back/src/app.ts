import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import morgan from "morgan";
// Routers
import roomRouter from "./routers/roomRouter";
import PgQuery from "./db/pg";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  //console.log(`Socket connection: ${socket.id}`);

  socket.on("join-room", async (roomId, cb) => {
    const room = await PgQuery.getRoom(roomId);

    // Joining chat socket room
    socket.join(roomId);
    console.log(socket.id + " has joined room " + roomId);
    //socket.emit("room-info", room);
    cb(room);
  });

  // Handle chat messages
  socket.on("msg", (roomId, author, msgText) => {
    socket.to(roomId).emit("msg", { author, msgText });
  });

  socket.on("disconnect", () => {
    console.log(`Closed socket: ${socket.id}`);
  });
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
