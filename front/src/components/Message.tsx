import { IMessage } from "../utils/interfaces";

interface IProps {
  msg: IMessage;
  showAuthor: boolean;
}

const Message = ({ msg: { author, msgText }, showAuthor }: IProps) => {
  const date = new Date();
  return (
    <div className={showAuthor ? "mt-3" : ""}>
      {showAuthor && (
        <p className="font-bold flex items-center justify-between pr-2">
          <span>{author}</span>
          <span className="text-xs text-gray-400 font-normal">{`${date.getHours()}h${date.getMinutes()}`}</span>
        </p>
      )}
      <p style={{ wordWrap: "break-word", paddingRight: "5px" }}>{msgText}</p>
    </div>
  );
};

export default Message;
