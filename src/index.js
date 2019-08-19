import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./index.css";

import useInterval from "./components/utils/useInterval";
import Dither, { Pixellator } from "./components/Ditherer";

function App() {
  const [pixelSize, setPixelSize] = useState(2);
  const [fontSize, setFontSize] = useState(30);
  useInterval(() => {
    setPixelSize(Math.round(Math.random() * 10 + 3));
    setFontSize(Math.round(Math.random() * 100 + 30));
  }, 5000);

  return (
    <div className="App">
      <Pixellator fontSize={60} pixelSize={pixelSize} springy color>
        Pixellate
      </Pixellator>
      <Pixellator fontSize={fontSize} pixelSize={5}>
        any font size.
      </Pixellator>
      <Pixellator fontSize={60} pixelSize={pixelSize} mouseDriven>
        full integer pixels only
      </Pixellator>
      <Pixellator fontSize={60} pixelSize={pixelSize} springy mouseDriven>
        or decimals too!
      </Pixellator>

      <div className="color-change">
        <Pixellator fontSize={60} pixelSize={pixelSize} springy color>
          such nice color
        </Pixellator>
      </div>
      <br />
      <Dither />
      <br />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
