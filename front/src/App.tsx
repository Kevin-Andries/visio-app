import { useEffect, useState, useContext } from "react";
import { Switch, Route } from "react-router-dom";
import { ContextState } from "./state/Provider";
// Views
import Home from "./views/Home";
import Room from "./views/Room";
import Contact from "./views/Contact";

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
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>

        <Route exact path="/contact">
          <Contact />
        </Route>

        <Route path="/:roomId">
          <Room />
        </Route>
      </Switch>
    </>
  );
}

export default App;
