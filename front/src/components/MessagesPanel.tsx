import Message from "./Message";

const MessagesPanel = ({ handleSubmit }: any) => {
  return (
    <>
      <div className="overflow-y-scroll py-4 pl-4">
        <Message />
      </div>

      <form className="flex m-5 mt-2" onSubmit={handleSubmit}>
        <input type="text" className="border-2 rounded-lg mr-3 w-full p-2 outline-none" />
        <button type="submit" className="p-3 rounded-lg bg-blue-600 text-white">
          Send
        </button>
      </form>
    </>
  );
};

export default MessagesPanel;
