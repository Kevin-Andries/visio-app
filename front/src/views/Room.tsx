import { useEffect } from "react";
import { io } from "socket.io-client";
// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoStreamingSpace from "../components/VideoStreamingSpace";
import Chat from "../components/Chat";

const Room = () => {
  // When we join a room, we connect to socket
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected to socket " + socket.id);
    });
  }, []);

  return (
    <div className="h-screen flex flex-col justify-between ">
      <Header />
      <h2 className="text-center font-bold text-3xl">ROOM NAME</h2>
      <div className="flex" style={{ height: "90%" }}>
        <VideoStreamingSpace />
        <Chat />
      </div>
      <Footer />
    </div>
  );
};

export default Room;
