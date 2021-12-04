import { useContext, useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";
// Components
import Message from "./Message";
// Misc
import { ContextState } from "../state/Provider";
import { IMessage } from "../utils/interfaces";

interface IProps {
  socket: Socket;
}

const Chat = ({ socket }: IProps) => {
  const { state } = useContext<any>(ContextState);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [msgText, setMsgText] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);

  // Scroll to bottom of the chat
  useEffect(() => {
    if (ref.current) ref.current.scrollIntoView();
  });

  // Listening to chat messages
  useEffect(() => {
    if (socket) {
      socket.on("msg", ({ author, authorId, msgText }) => {
        console.log("CHAT MSG RECEIVED");
        addMsg({ author, authorId, msgText });
      });
    }
  }, [socket]);

  const addMsg = (msg: IMessage) => {
    setMessages((prevState: any) => [...prevState, msg]);
  };

  const handleChange = (e: any) => {
    setMsgText(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (socket && msgText) {
      socket.emit("msg", state.token, msgText);
      addMsg({ author: state.username, authorId: socket.id, msgText });
      setMsgText("");
    }
  };

  return (
    <div className="h-full mx-5 md:w-96 lg:w-1/4 rounded-xl border-2 flex flex-col justify-end relative">
      <div className=" pl-4 overflow-y-scroll h-full">
        {messages.map((message: IMessage, i: number, array: any) => {
          let showAuthor = true;

          if (array[i - 1] && array[i - 1].authorId === message.authorId) {
            showAuthor = false;
          }

          return <Message key={uuid()} msg={message} showAuthor={showAuthor} />;
        })}
        <div ref={ref}></div>
      </div>

      <form className="flex m-5 mt-2" onSubmit={handleSubmit}>
        <input onChange={handleChange} value={msgText} type="text" className="border-2 rounded-lg sm:mr-3 w-full p-2 outline-none" />
        <button type="submit" className="p-3 rounded-lg bg-blue-600 text-white hidden sm:block ">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
