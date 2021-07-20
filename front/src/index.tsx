import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// Context provider for global state
import ContextProvider from "./state/Provider";
// Makes tailwind available everywhere
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
