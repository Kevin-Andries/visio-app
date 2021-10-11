import { IMessage } from "../utils/interfaces";
import { formatTime } from "../utils/formatTime";

interface IProps {
  msg: IMessage;
  showAuthor: boolean;
}

const Message = ({ msg: { author, msgText }, showAuthor }: IProps) => {
  return (
    <div className={showAuthor ? "mt-3" : ""}>
      {showAuthor && (
        <p className="font-bold flex items-center justify-between pr-2">
          <span>{author}</span>
          <span className="text-xs text-gray-400 font-normal">{formatTime()}</span>
        </p>
      )}
      <p style={{ wordWrap: "break-word", paddingRight: "5px" }}>{msgText}</p>
    </div>
  );
};

export default Message;
