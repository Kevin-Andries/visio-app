import { useEffect, useState, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { useHistory } from "react-router-dom";
// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoStreamingSpace from "../components/VideoStreamingSpace";
import Chat from "../components/Chat";
// Misc
import { ContextState } from "../state/Provider";
import { joinRoomAction } from "../state/actions";

const Room = () => {
  const { dispatch } = useContext<any>(ContextState);
  const history = useHistory();
  const [socketState, setSocket] = useState<any>();
  const [roomId] = useState(history.location.pathname.substring(1));

  // When we join a room, we connect to socket
  useEffect(() => {
    const socket: Socket = io("http://localhost:3001");
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Connected to socket " + socket.id);
      /** Not working */
      socket.emit("join-room", roomId, (res: any) => {
        dispatch(joinRoomAction(roomId));
      });
    });

    // Cleaning function, when component unmounts, we close socket connection
    return () => {
      socket.close();
      console.log("socket has been closed");
    };
  }, [roomId, dispatch]);

  return (
    <div className="h-screen flex flex-col justify-between ">
      <Header />
      <h2 className="text-center font-bold text-3xl">ROOM NAME</h2>
      <div className="flex" style={{ height: "90%" }}>
        <VideoStreamingSpace />
        <Chat socket={socketState} />
      </div>
      <Footer />
    </div>
  );
};

export default Room;
