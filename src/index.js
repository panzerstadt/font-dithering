import React, { useState } from "react";
import ReactDOM from "react-dom";
import Helmet from "react-helmet";

import "./index.css";

import useInterval from "./components/utils/useInterval";
import Dither, { Pixellator } from "./components/Ditherer";

const FontFix = () => {
  const isDev = process.env.REACT_APP_DEV ? true : false;

  return isDev ? (
    <Helmet>
      <base href="/" />
      <script type="text/javascript">var customPath = "/fonts";</script>
      <script type="text/javascript" src="/fonts/webfonts.js" />
    </Helmet>
  ) : (
    <Helmet>
      <base href="/build/" />
      <script type="text/javascript">var customPath = "/build/fonts";</script>
      <script type="text/javascript" src="/build/fonts/webfonts.js" />
    </Helmet>
  );
};

function App() {
  const [pixelSize, setPixelSize] = useState(2);
  const [fontSize, setFontSize] = useState(30);
  useInterval(() => {
    setPixelSize(Math.round(Math.random() * 10 + 3));
    setFontSize(Math.round(Math.random() * 100 + 30));
  }, 5000);

  return (
    <div className="App">
      <FontFix />
      <Pixellator fontSize={60} pixelSize={pixelSize} springy color>
        Pixellate
      </Pixellator>

      <br />
      <Dither />
      <br />

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
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
