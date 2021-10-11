import { useEffect, useContext } from "react";
import { Switch, Route } from "react-router-dom";
// Components
import { setLoadingMediaAction, setMediaAction, setUserNameAction } from "./state/actions";
import { ContextState } from "./state/Provider";
// Views
import Home from "./views/Home";
import Room from "./views/Room";
import Contact from "./views/Contact";

function App() {
  const { /* state, */ dispatch } = useContext<any>(ContextState);

  // We request user's permission to use microphone and webcam on start
  // and check if there is a username in localStorage
  useEffect(() => {
    // Show API URL being used
    console.log("URL API: " + process.env.REACT_APP_API_URL);
    dispatch(setUserNameAction(localStorage.getItem("username") || ""));

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

  // log media object in console once it's set
  //useEffect(() => console.log("State: ", state), [state]);

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
