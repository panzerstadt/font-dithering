import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

import Dither, { Pixellator } from "./components/Ditherer";

function App() {
  return (
    <div className="App">
      <Pixellator fontSize={50}>Pixellate</Pixellator>
      <Dither />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
