import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";

// Context provider for global state
import ContextProvider from "./state/Provider";
// Makes tailwind available everywhere
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ContextProvider>
        <App />
      </ContextProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
