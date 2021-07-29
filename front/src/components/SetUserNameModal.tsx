import { useContext, useState } from "react";
// Misc
import { ContextState } from "../state/Provider";
import { setUserNameAction } from "../state/actions";

const SetUsernameModal = () => {
  const [username, setUsername] = useState<string>("");
  const { dispatch } = useContext<any>(ContextState);

  const updateName = (e: any) => setUsername(e.target.value);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (username) {
      dispatch(setUserNameAction(username));
    }
  };

  return (
    <>
      <div className="fixed h-screen w-screen top-0 l-0 bg-black opacity-70 z-10"></div>
      <div className="fixed transform translate-x-2/4 -translate-y-2/4 right-2/4 top-2/4 w-80 z-20">
        <form onSubmit={handleSubmit} className="flex bg-white p-12 flex-col rounded-lg ">
          <input onChange={updateName} className="mb-4" type="text" name="userName" placeholder="Type your name" />
          <button type="submit" className="p-3 rounded-lg bg-blue-600 text-white">
            Save
          </button>
        </form>
      </div>
    </>
  );
};

export default SetUsernameModal;
