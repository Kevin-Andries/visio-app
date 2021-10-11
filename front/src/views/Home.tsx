import { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
// Components
import { ContextState } from "../state/Provider";
import { createNewRoomAction, resetAction, setUserNameAction } from "../state/actions";
import Header from "../components/Header";
import JoinRoomModal from "../components/JoinRoomModal";
//import EditUsername from "../components/EditUsername";
import Footer from "../components/Footer";
import EditUsername from "../components/EditUsername";

const Home = () => {
  const { state, dispatch } = useContext<any>(ContextState);
  const [joinRoomModal, setToggleJoinRoomModal] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const history = useHistory();

  useEffect(() => {
    dispatch(resetAction());
  }, [dispatch]);

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

  // Edit username functions
  const toggleSetUsername = () => {
    setEditUsername((prev) => !prev);
  };

  const handleEditUsername = () => {
    setEditUsername((prev) => !prev);
  };

  const handleSetUsername = (username: string) => {
    dispatch(setUserNameAction(username));
    setEditUsername(false);
  };

  // Join room functions
  const toggleJoinRoomModal = () => {
    setToggleJoinRoomModal((prev) => !prev);
  };

  return (
    <div className="h-screen flex flex-col justify-between">
      <Header />
      {joinRoomModal && <JoinRoomModal toggleJoinRoomModal={toggleJoinRoomModal} />}

      {showError()}
      <div className="flex flex-col justify-center items-center">
        {state.username && (
          <div className="mb-3">
            {editUsername ? (
              <EditUsername handleSetUsername={handleSetUsername} toggleSetUsername={toggleSetUsername} />
            ) : (
              <p onClick={handleEditUsername} className="cursor-pointer">
                Your username: <span className="font-bold">{state.username}</span>
              </p>
            )}
          </div>
        )}
        <button onClick={handleCreateRoom} className="text-white bg-blue-600 font-light text-2xl rounded-lg p-2 px-8 shadow-xl">
          Create a room
        </button>
        <button
          onClick={() => setToggleJoinRoomModal((prev) => !prev)}
          className="text-blue-600 border-2 border-blue-600 rounded-lg p-2 px-4 shadow-xl mt-5">
          Join a room
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
