import { useContext, useState } from "react";
import { ContextState } from "../state/Provider";

const MuteButton = () => {
  const { state } = useContext<any>(ContextState);
  const [isListening, setIsListening] = useState(state.media ? state.media.getAudioTracks()[0].enabled : true);

  const handleClick = () => {
    state.media.getAudioTracks()[0].enabled = !state.media.getAudioTracks()[0].enabled;
    setIsListening((prev: Boolean) => !prev);
  };

  return (
    <button onClick={handleClick} className="ml-5 rounded-full h-20 w-20 text-white bg-blue-600">
      {isListening ? "MUTE" : "UNMUTE"}
    </button>
  );
};

export default MuteButton;
