import { useEffect, useContext } from "react";
import { Switch, Route } from "react-router-dom";
// Components
import { setLoadingMediaAction, setMediaAction } from "./state/actions";
import { ContextState } from "./state/Provider";
// Views
import Home from "./views/Home";
import Room from "./views/Room";
//import RoomClass from "./views/RoomClass";
import Contact from "./views/Contact";

// TODO: CSS
// TODO: proper errors handling

function App() {
  const { dispatch } = useContext(ContextState);

  // We request user's permission to use microphone and webcam on start
  // and check if there is a username in localStorage
  useEffect(() => {
    // Show API URL being used
    console.log("URL API: " + process.env.REACT_APP_API_URL);

    (async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        dispatch(setMediaAction(localStream));
      } catch (e) {
        console.error("No microphone/webcam found");
      } finally {
        dispatch(setLoadingMediaAction(false));
      }
    })();
  }, [dispatch]);

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
