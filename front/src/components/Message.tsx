import { IMessage } from "../utils/interfaces";

interface IProps {
  msg: IMessage;
  showAuthor: boolean;
}

function formatTime() {
  const date = new Date();

  const hours = date.getHours();
  const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();

  return `${hours}h${minutes}`;
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
