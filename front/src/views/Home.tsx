import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
// Components
import { ContextState } from "../state/Provider";
import { createNewRoomAction } from "../state/actions";
import Header from "../components/Header";
import JoinRoomModal from "../components/JoinRoomModal";
import Footer from "../components/Footer";

const Home = () => {
  const { state, dispatch } = useContext<any>(ContextState);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomExists, setRoomExists] = useState(true);
  const [roomNumber, setRoomNumber] = useState(null);
  const history = useHistory();

  const showError = () => {
    return (
      !state.loadingMedia &&
      !state.media && (
        <p className="fixed transform translate-x-2/4 -translate-y-2/4 right-2/4 top-40 text-red-500">No cam/micro available !</p>
      )
    );
  };

  const handleCreateRoom = async () => {
    const { roomId } = await fetch("http://localhost:3001/room").then((res) => res.json());

    dispatch(createNewRoomAction(roomId));
    history.push(`/${roomId}`);
  };

  const toggleJoinRoom = () => {
    setIsJoiningRoom((prev) => !prev);
    setRoomExists(true);
  };

  const updateJoinRoomInputValue = (e: any) => {
    setRoomNumber(e.target.value);
  };

  const handleJoinRoomSubmit = (e: any) => {
    e.preventDefault();

    if (!roomNumber) {
      setRoomExists(false);
      return;
    }

    if (roomNumber === state.activeRooms) {
      setRoomExists(true);
      history.push(`/${roomNumber}`);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-between">
      <Header />
      <JoinRoomModal
        roomExists={roomExists}
        updateJoinRoomInputValue={updateJoinRoomInputValue}
        show={isJoiningRoom}
        toggle={toggleJoinRoom}
        handleJoinRoomSubmit={handleJoinRoomSubmit}
      />
      {showError()}
      <div className="flex flex-col justify-center items-center">
        <button onClick={handleCreateRoom} className="text-white bg-blue-600 font-light text-2xl rounded-lg p-2 px-8 shadow-xl">
          Create a room
        </button>
        <button onClick={toggleJoinRoom} className="text-blue-600 border-2 border-blue-600 rounded-lg p-2 px-4 shadow-xl mt-5">
          Join a room
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
