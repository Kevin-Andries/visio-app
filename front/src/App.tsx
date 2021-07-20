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
        <button className="text-blue-600 font-medium text-2xl" style={{ marginBottom: "10px" }}>
          Create a room
        </button>
        <button>Join a room</button>
      </div>
      <div style={{ height: "15vh" }}>All rights reserved</div>
    </>
  );
}

export default App;
