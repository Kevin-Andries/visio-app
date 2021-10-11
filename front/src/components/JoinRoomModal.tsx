import { useState } from "react";
import { useHistory } from "react-router-dom";

interface IProps {
  toggleJoinRoomModal: any;
}

const JoinRoomModal = ({ toggleJoinRoomModal }: IProps) => {
  const history = useHistory();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (e: any) => {
    setRoomId(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    handleJoinRoomSubmit(roomId);
  };

  const handleJoinRoomSubmit = async (roomId: string) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/room/${roomId}`);

    if (res.status === 404) {
      return setError(true);
    }

    history.push(`/${roomId}`);
  };

  return (
    <>
      <div onClick={toggleJoinRoomModal} className="fixed h-screen w-screen top-0 l-0 bg-black opacity-70 z-10"></div>
      <div className="fixed transform translate-x-2/4 -translate-y-2/4 right-2/4 top-2/4 w-80 z-20">
        <span onClick={toggleJoinRoomModal} className="absolute right-4 top-3 cursor-pointer">
          &#x274C;
        </span>
        <form className="flex bg-white p-12 flex-col rounded-lg" onSubmit={handleSubmit}>
          <label htmlFor="roomId" className="mb-2">
            Enter room ID
          </label>
          <input
            required
            id="roomId"
            type="text"
            onChange={handleChange}
            className="mb-3 shadow-sm p-1 border-2 rounded border-blue-600 outline-none"
          />
          <input type="submit" value="Join" className="p-1 bg-blue-600 text-white rounded-lg cursor-pointer" />
          {error && (
            <div className="bg-red-600 mt-3 p-2 text-white rounded-lg text-sm text-center">
              This room id seems to be wrong. Please review it and try again.
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default JoinRoomModal;
