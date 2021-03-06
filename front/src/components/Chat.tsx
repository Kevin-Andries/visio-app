import { useContext, useState, useEffect } from "react";
import { Socket } from "socket.io-client";
// Components
import MessagesPanel from "./MessagesPanel";
// Misc
import { ContextState } from "../state/Provider";
import { IMessage } from "../utils/interfaces";

interface IProps {
  socket: Socket;
}

const Chat = ({ socket }: IProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { state } = useContext<any>(ContextState);

  // Listening to chat messages
  useEffect(() => {
    if (socket) {
      socket.on("msg", ({ author, msgText }) => {
        addMsg({ author, msgText });
      });
    }
  }, [socket]);

  const handleSubmitMsg = (msgText: string) => {
    socket.emit("msg", state.roomId, state.username, msgText);
    addMsg({ author: state.username, msgText });
  };

  const addMsg = (msg: IMessage) => {
    setMessages((prevState: any) => [...prevState, msg]);
  };

  return (
    <div className="h-full mx-5 w-1/3 rounded-xl border-2 flex flex-col justify-end relative overflow-y-scroll">
      <MessagesPanel messages={messages} handleSubmitMsg={handleSubmitMsg} />
    </div>
  );
};

export default Chat;
