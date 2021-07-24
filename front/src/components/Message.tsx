import { IMessage } from "../utils/interfaces";

const Message = ({ author, msgText }: IMessage) => {
  return (
    <div className="mb-3">
      <p className="font-bold">{author}</p>
      <p>{msgText}</p>
    </div>
  );
};

export default Message;
