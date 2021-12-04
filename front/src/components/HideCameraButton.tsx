import { useContext, useState } from "react";
import { ContextState } from "../state/Provider";

const HideCameraButton = () => {
  const { state } = useContext<any>(ContextState);
  const [isShowing, setIsShowing] = useState(state.media ? state.media.getVideoTracks()[0].enabled : true);

  const handleClick = () => {
    state.media.getVideoTracks()[0].enabled = !state.media.getVideoTracks()[0].enabled;
    setIsShowing((prev: Boolean) => !prev);
  };

  return (
    <button onClick={handleClick} className="ml-5 rounded-full h-20 w-20 text-white bg-green-700">
      {isShowing ? "HIDE CAMERA" : "SHOW CAMERA"}
    </button>
  );
};

export default HideCameraButton;
