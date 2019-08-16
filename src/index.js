import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

import Dither from "./components/Ditherer";

function App() {
  return (
    <div className="App">
      <h1>Font Ditherer</h1>
      <Dither />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
