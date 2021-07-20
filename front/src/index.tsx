import React from "react";
import ReactDOM from "react-dom";

// Makes tailwind available everywhere
import "./index.css";

import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
