import { Server } from "socket.io";
import { server } from "../app";
import { verify } from "../utils/jwt";

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connection: ${socket.id}`);

  socket.on("join-room", (roomId, cb) => {
    // A client joins chat socket room
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
  socket.on("msg", (token, author, msgText) => {
    const tokenData: any = verify(token);

    // If token is valid we send the message to the roomId contained inside of it
    if (tokenData) socket.to(tokenData.roomId).emit("msg", { author, authorId: socket.id, msgText });
  });

  /* socket.on("disconnect", (roomId) => {
      console.log(`Closed socket: ${socket.id}`);
      socket.to(roomId).emit("user-left", socket.id);
    }); */
});
