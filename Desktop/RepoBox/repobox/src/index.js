import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import FirebaseContext from "./Store/FirebaseContext";
import Firebase from "./Firebase/Config";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <FirebaseContext.Provider value={{ Firebase }}>
    <App />
  </FirebaseContext.Provider>
);