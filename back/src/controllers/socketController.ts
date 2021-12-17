import { Server } from "socket.io";
import { server } from "../app";
import { verify } from "../utils/jwt";

function print(msg: string) {
  console.log("\x1b[31m%s\x1b[0m", msg);
}

const io = new Server(server, {
  cors: {
    // TODO: put right url for cors
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connection: ${socket.id}`);

  socket.on("join-room", (roomId: any) => {
    print("join-room");

    // A client joins room socket
    socket.join(roomId);
    socket.to(roomId).emit("new-peer-joined", socket.id);
  });

  /**  WebRTC **/
  socket.on("offer", (peerId: any, offer: any) => {
    print("offer");
    socket.to(peerId).emit("sdp-offer", socket.id, offer);
  });

  socket.on("answer", (peerId, answer) => {
    print("answer");
    socket.to(peerId).emit("sdp-answer", socket.id, answer);
  });

  socket.on("ice-candidate", (peerId, ice) => {
    print("ice-candidate");
    socket.to(peerId).emit("new-ice-candidate", socket.id, ice);
  });

  // Handle chat messages
  socket.on("msg", (token, msgText) => {
    print("msg");
    if (!msgText || !token) return;

    const tokenData: any = verify(token);

    // If token is valid we send the message to the roomId contained inside of it
    if (tokenData) {
      socket.to(tokenData.roomId).emit("msg", { author: tokenData.author, authorId: socket.id, msgText });
    }
  });

  socket.on("leaving", (roomId) => {
    socket.to(roomId).emit("user-left", socket.id);
  });

  socket.on("disconnect", () => {
    console.log(`Closed socket: ${socket.id}`);
  });
});
