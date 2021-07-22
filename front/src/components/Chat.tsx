const Chat = () => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  return (
    <div className="h-full mx-5 w-1/3 rounded-xl border-2 flex flex-col justify-end ">
      <div className="overflow-y-scroll py-4 pl-4">
        <p className="mb-3">
          <span className="font-bold">Jon: </span> Hey, how are you ?
        </p>
        <p>
          <span className="font-bold">Kevin: </span> Good, and you ?
        </p>
      </div>
      <form className="flex m-5 mt-2" onSubmit={handleSubmit}>
        <input type="text" className="border-2 rounded-lg mr-3 w-full p-2 outline-none" />
        <input type="submit" className="p-3 rounded-lg bg-blue-600 text-white cursor-pointer" />
      </form>
    </div>
  );
};

export default Chat;
