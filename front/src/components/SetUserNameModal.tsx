import { useContext, useState } from "react";
// Misc
import { ContextState } from "../state/Provider";
import { setUserNameAction } from "../state/actions";

const SetUserNameModal = () => {
  const [username, setUsername] = useState<string>("");
  const { dispatch } = useContext<any>(ContextState);

  const updateName = (e: any) => setUsername(e.target.value);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    dispatch(setUserNameAction(username));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute flex flex-col top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white z-50 p-5 rounded-lg"
      style={{ width: "85%" }}>
      <input onChange={updateName} className="mb-4" type="text" name="userName" placeholder="Type your name" />
      <button type="submit" className="p-3 rounded-lg bg-blue-600 text-white">
        Join chat
      </button>
    </form>
  );
};

export default SetUserNameModal;
