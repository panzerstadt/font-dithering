import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

// retoggle doesn't build properly for now (0.3.0)
import {
  Inspector,
  useRangeKnob,
  useBooleanKnob,
  useLog,
  useTimeMachine,
  useTextKnob,
  useSelectKnob
} from "retoggle";

import Webcam from "./components/Camera";
import Canvas from "./components/Canvas";
import { rgb, clamp, pixellate, remap } from "./components/Pixellation";
import useInterval from "../utils/useInterval";
import useMousePos from "../utils/useMousePos";

import styles from "./Ditherer.module.css";

const MIN_PIXEL = 10;
const MAX_PIXEL = 200;

const MotionDetector = () => {
  // mouse driven events
  const mousePos = useMousePos();
  const roundedPos = Math.round(
    remap(mousePos.x, 0, window.innerWidth, MIN_PIXEL, MAX_PIXEL)
  );

  // knobs
  const [text, setText] = useTextKnob("Input Text", "lorem ipsum");
  const [fontFamily, setFontFamily] = useSelectKnob(
    "Font Family",
    ["Arial", "Montserrat", "Open Sans", "Roboto", "Lexend Deca"],
    "Arial"
  );
  const [fontSize, setFontSize] = useRangeKnob("Font Size", {
    initialValue: 90,
    min: 30,
    max: 300
  });
  const [isMouse, setIsMouse] = useBooleanKnob("mouse sampling", true);
  const [n, setN] = useRangeKnob("manual sampling", {
    initialValue: 20,
    min: MIN_PIXEL,
    max: MAX_PIXEL
  });
  const [isFloat, setIsFloat] = useBooleanKnob(
    "dither on decimal points",
    false
  );
  const [isAnimating, setIsAnimating] = useBooleanKnob("animate", false);
  const [isInverted, setIsInverted] = useBooleanKnob("invert", false);
  const [isColor, setIsColor] = useBooleanKnob("color mode (original)", false);

  const timeMachinePixel = useTimeMachine(
    "Sampling History",
    isMouse ? Math.max(roundedPos, 10) : n
  );

  useLog("Font Size", fontSize);
  useLog("pixel sample size", (isMouse ? timeMachinePixel : n) / 10);

  useInterval(
    () => {
      setIsMouse(false);
      if (n >= 100) {
        setN(20);
      } else {
        setN(p => p + 1);
      }
    },
    isAnimating ? 100 : null
  );

  // the logic stuff
  const [webcamRef, setWebcamRef] = useState();
  const [textRef, setTextRef] = useState();
  const [ctx, setCtx] = useState();
  const [ctxOriginal, setCtxOriginal] = useState();

  const drawPixelatedText = (ctx, e, sampleSize, debug) => {
    // only works for sample sizes at .5 increments !?
    // when reading text, shift sampling by .5
    let text = e.innerHTML;

    let h = Math.max(fontSize * 1.5, 100);
    let w = 640;

    ctx.canvas.height = h;
    ctx.canvas.width = w;

    // if the font is too small, it gets lost
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillText(text, 20, fontSize);

    //pixellate(ctx, sampleSize, w, h);
    let data, sourceBuffer32;
    if (isColor) {
      data = ctx.getImageData(0, 0, w, h).data;
    } else {
      sourceBuffer32 = new Uint32Array(
        ctx.getImageData(0, 0, w, h).data.buffer
      );
    }

    !debug && ctx.clearRect(0, 0, w, h);

    // let dataExists = {};
    // Array.from(data).map((v, i) => v > 0 && (dataExists[i] = v));
    // console.log(dataExists);

    sampleSize = isFloat ? sampleSize / 10 : Math.round(sampleSize / 10);

    for (let y = 0; y < h; y += sampleSize) {
      for (let x = 0; x < w; x += sampleSize) {
        // the data array is a continuous array of red, blue, green
        // and alpha values, so each pixel takes up four values
        // in the array

        let r, g, b, pos;
        if (isColor) {
          sourceBuffer32 = [];
          pos = y * (w * 4) + x * 4 - 1;
          // this is the right formula
          // ref: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas

          //var pos = (x + y * w) * 4;
          // this is the wrong one
          // ref: https://hackernoon.com/creating-a-pixelation-filter-for-creative-coding-fc6dc1d728b2

          r = data[pos];
          g = data[pos + 1];
          b = data[pos + 2];
        } else {
          data = [];
          pos = y * w + x;
          // this is the sourcebuffer version

          r = sourceBuffer32[pos] >> 0 && 0xff;
          g = sourceBuffer32[pos] >> 8 && 0xff;
          b = sourceBuffer32[pos] >> 16 && 0xff;
        }

        ctx.fillStyle = rgb(r, g, b);
        !debug && ctx.centreFillRect(x, y, sampleSize, sampleSize);
      }
    }
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      textRef && drawPixelatedText(ctx, textRef, timeMachinePixel);
      textRef && drawPixelatedText(ctxOriginal, textRef, 100, true);
    });
  }, [
    textRef,
    text,
    fontSize,
    fontFamily,
    isInverted,
    timeMachinePixel,
    n,
    isFloat
  ]);

  const variants = {
    hidden: {
      opacity: 0,
      y: 100
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3
      }
    }
  };

  return (
    <div className={styles.container}>
      <Inspector usePortal={true} />
      <br />
      <motion.div
        className={styles.canvasContainer}
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        <Canvas
          className={
            isInverted
              ? isColor
                ? styles.canvasColorOutInverted
                : styles.canvasOutInverted
              : isColor
              ? styles.canvasColorOut
              : styles.canvasOut
          }
          onContext={setCtx}
          mirrored={webcamRef ? true : false}
        />
      </motion.div>
      <br />
      <motion.div
        className={styles.canvasContainer}
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        <Canvas
          className={styles.canvas}
          onContext={setCtxOriginal}
          mirrored={webcamRef ? true : false}
        />
      </motion.div>

      {/* <Webcam onRef={setWebcamRef} hide /> */}
      <h1 ref={setTextRef} style={{ display: "none" }}>
        {text}
      </h1>
    </div>
  );
};

export default MotionDetector;
