interface IProps {
  show: boolean;
  roomExists: boolean;
  toggle: () => void;
  handleJoinRoomSubmit: (e: any) => void;
  updateJoinRoomInputValue: (e: any) => void;
}

const JoinRoomModal = ({ show, toggle, handleJoinRoomSubmit, updateJoinRoomInputValue, roomExists }: IProps) =>
  show ? (
    <>
      <div onClick={toggle} className="fixed h-screen w-screen top-0 l-0 bg-black opacity-70 z-10"></div>
      <div className="fixed transform translate-x-2/4 -translate-y-2/4 right-2/4 top-2/4 w-80 z-20">
        <span onClick={toggle} className="absolute right-4 top-3 cursor-pointer">
          &#x274C;
        </span>
        <form className="flex bg-white p-12 flex-col rounded-lg" onSubmit={handleJoinRoomSubmit}>
          <label htmlFor="roomId" className="mb-2">
            Enter room ID
          </label>
          <input
            id="roomId"
            type="text"
            onChange={updateJoinRoomInputValue}
            className="mb-3 shadow-sm p-1 border-2 rounded border-blue-600 outline-none"
          />
          <input type="submit" value="Join" className="p-1 bg-blue-600 text-white rounded-lg cursor-pointer" />
          {!roomExists && (
            <div className="bg-red-600 mt-3 p-2 text-white rounded-lg text-sm text-center">
              This room id seems to be wrong. Please review it and try again.
            </div>
          )}
        </form>
      </div>
    </>
  ) : null;

export default JoinRoomModal;
