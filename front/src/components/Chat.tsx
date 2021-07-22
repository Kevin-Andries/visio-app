import { useContext, useState } from "react";
// Components
import { ContextState } from "../state/Provider";
import { setUserName } from "../state/actions";
import MessagesPanel from "./MessagesPanel";
import SetUserNameModal from "./SetUserNameModal";

const Chat = () => {
  const [user, setUser] = useState("");
  const { state, dispatch } = useContext<any>(ContextState);

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  const updateName = (e: any) => setUser(e.target.value);

  const setNewUser = (e: any) => {
    e.preventDefault();

    dispatch(setUserName(user));
  };

  return (
    <div className="h-full mx-5 w-1/3 rounded-xl border-2 flex flex-col justify-end relative">
      {!state.userName && <div className="h-full w-fulltop-0 l-0 bg-black opacity-70 z-10 rounded-lg"></div>}
      {state.userName && <MessagesPanel handleSubmit={handleSubmit} />}
      {!state.userName && <SetUserNameModal setNewUser={setNewUser} updateName={updateName} />}
    </div>
  );
};

export default Chat;
