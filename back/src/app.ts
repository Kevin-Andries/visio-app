import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import morgan from "morgan";
// Routers
import roomRouter from "./routers/roomRouter";
//import PgQuery from "./db/pg";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connection: ${socket.id}`);

  socket.on("join-room", async (roomId, cb) => {
    //const room = await PgQuery.getRoom(roomId);

    // User joins chat socket room
    socket.join(roomId);
    socket.to(roomId).emit("new-peer-joined", socket.id);
    cb();
  });

  /**  WebRTC **/
  socket.on("offer", (peerId, offer) => {
    socket.to(peerId).emit("sdp-offer", socket.id, offer);
  });

  socket.on("answer", (peerId, answer) => {
    socket.to(peerId).emit("sdp-answer", socket.id, answer);
  });

  socket.on("ice-candidate", (peerId, ice) => {
    socket.to(peerId).emit("new-ice-candidate", socket.id, ice);
  });

  // Handle chat messages
  socket.on("msg", (roomId, author, msgText) => {
    socket.to(roomId).emit("msg", { author, authorId: socket.id, msgText });
  });

  /* socket.on("disconnect", (roomId) => {
    console.log(`Closed socket: ${socket.id}`);
    socket.to(roomId).emit("user-left", socket.id);
  }); */
});

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
