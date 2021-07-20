import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
// Components
import { ContextState } from "../state/Provider";
import Header from "../components/Header";
import JoinRoomModal from "../components/JoinRoomModal";

const Home = () => {
  const { state } = useContext<any>(ContextState);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const history = useHistory();

  const showError = () => {
    return !state.loadingMedia && !state.media && <p className="text-red-500 text-center">No cam/micro available !</p>;
  };

  const handleCreateRoom = async () => {
    const { roomId } = await fetch("http://localhost:3001/room", { method: "POST" }).then((res) => res.json());
    history.push(`/${roomId}`);
  };

  const toggleJoinRoom = () => setIsJoiningRoom((prev) => !prev);

  const handleJoinRoomSubmit = (e: any) => {
    e.preventDefault();
  };

  return (
    <>
      <Header />
      <JoinRoomModal show={isJoiningRoom} toggle={toggleJoinRoom} handleJoinRoomSubmit={handleJoinRoomSubmit} />
      {showError()}
      <div style={{ height: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <button onClick={handleCreateRoom} className="text-white bg-blue-600 font-light text-2xl rounded-lg p-2 px-8 shadow-xl">
          Create a room
        </button>
        <button onClick={toggleJoinRoom} className="text-blue-600 border-2 border-blue-600 rounded-lg p-2 px-4 shadow-xl mt-5">
          Join a room
        </button>
      </div>
    </>
  );
};

export default Home;
