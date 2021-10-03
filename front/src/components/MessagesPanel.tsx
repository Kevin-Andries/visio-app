import { useState } from "react";
import { v4 as uuid } from "uuid";
// Components
import Message from "./Message";
// Misc
import { IMessage } from "../utils/interfaces";

interface IProps {
  messages: IMessage[];
  handleSubmitMsg: (msgText: string) => void;
}

const MessagesPanel = ({ messages, handleSubmitMsg }: IProps) => {
  const [msgText, setMsgText] = useState<string>("");

  const handleChange = (e: any) => {
    setMsgText(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (msgText) {
      handleSubmitMsg(msgText);
      setMsgText("");
    }
  };
  // className="break-words"
  return (
    <>
      <div className="py-4 pl-4">
        {messages.map((message: IMessage, i: number, array: any) => {
          let showAuthor = true;

          if (array[i - 1] && array[i - 1].authorId === message.authorId) {
            showAuthor = false;
          }

          return <Message key={uuid()} msg={message} showAuthor={showAuthor} />;
        })}
      </div>

      <form className="flex m-5 mt-2" onSubmit={handleSubmit}>
        <input onChange={handleChange} value={msgText} type="text" className="border-2 rounded-lg sm:mr-3 w-full p-2 outline-none" />
        <button type="submit" className="p-3 rounded-lg bg-blue-600 text-white hidden sm:block ">
          Send
        </button>
      </form>
    </>
  );
};

export default MessagesPanel;
