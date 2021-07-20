import { useEffect, useState, useContext } from "react";
// Components

import Header from "./components/Header";
import { ContextState } from "./state/Provider";

function App() {
  const [media, setMedia] = useState<MediaStream>();
  const { state, dispatch } = useContext<any>(ContextState);

  // We request user's permission to use microphone and webcam on start
  useEffect(() => {
    (async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMedia(localStream);
      } catch (e) {
        console.error("No microphone/webcam found");
      }
    })();
  }, []);

  // log media object in console once it's set
  useEffect(() => console.log("Media object: ", media), [media]);

  return (
    <>
      <Header />
      <div style={{ height: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <button className="text-white bg-blue-600 font-light text-2xl rounded-lg p-2 px-8 shadow-xl" style={{ marginBottom: "10px" }}>
          Create a room
        </button>
        <button className="text-blue-600 border-2 border-blue-600 rounded-lg p-2 px-4 shadow-xl mt-2">Join a room</button>
      </div>
    </>
  );
}

export default App;
