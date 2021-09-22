import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
// Components
import { ContextState } from "../state/Provider";
import { createNewRoomAction, setUserNameAction } from "../state/actions";
import Header from "../components/Header";
import JoinRoomModal from "../components/JoinRoomModal";
import Footer from "../components/Footer";

const Home = () => {
  const { state, dispatch } = useContext<any>(ContextState);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomExists, setRoomExists] = useState(true);
  const [roomNumber, setRoomNumber] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [username, setUsername] = useState("");
  const history = useHistory();

  const showError = () => {
    return (
      !state.loadingMedia &&
      !state.media && (
        <p className="absolute transform translate-x-2/4 -translate-y-2/4 right-2/4 top-40 text-red-500">No cam/micro available !</p>
      )
    );
  };

  const handleCreateRoom = async () => {
    const { roomId } = await fetch(`${process.env.REACT_APP_API_URL}/room`).then((res) => res.json());
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
      return setRoomExists(false);
    }

    setRoomExists(true);
    history.push(`/${roomNumber}`);
  };

  const getUsername = () => {
    return localStorage.getItem("username");
  };

  const handleEditUsername = () => {
    setEditingUsername((prevState) => !prevState);
  };

  const handleEditUsernameChange = (e: any) => {
    setUsername(e.target.value);
  };

  const handleChangeUsername = (e: any) => {
    e.preventDefault();
    dispatch(setUserNameAction(username));
    setEditingUsername(false);
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
        {state.username && (
          <div className="mb-3">
            {editingUsername ? (
              <form onSubmit={handleChangeUsername}>
                <input type="text" className="border-2 -m-1" onChange={handleEditUsernameChange} autoFocus />
                <span onClick={handleEditUsername} className="cursor-pointer ml-3">
                  &#x274C;
                </span>
              </form>
            ) : (
              <p onClick={handleEditUsername} className="cursor-pointer">
                Your username: <span className="font-bold">{getUsername()}</span>{" "}
              </p>
            )}
          </div>
        )}
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
