import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Spring } from "react-spring/renderprops";

import Canvas from "./components/Canvas";
import { rgb, remap } from "./components/Pixellation";
import useMousePos from "../utils/useMousePos";

import styles from "./Pixellator.module.css";

const fontFamily = "Lexend Deca";
const isColor = false;
const isInverted = false;
const isSpringy = true;

const Ditherer = ({ children, fontSize = 90, minSize = 10, maxSize = 100 }) => {
  // mouse driven events
  const mousePos = useMousePos();
  const mousePosSample = Math.max(
    Math.round(remap(mousePos.x, 0, window.innerWidth, minSize, maxSize)),
    10
  ); // should not go below 10

  // input value / 10 in order to work with retoggle sliders
  let sample = Math.round(mousePosSample / 10);

  // the logic stuff
  const [textRef, setTextRef] = useState(null);
  const [ctx, setCtx] = useState();

  const drawPixelatedText = (ctx, e, sampleSize, debug) => {
    // only works for sample sizes at .5 increments !?
    // when reading text, shift sampling by .5
    let text = e.innerHTML;

    let h = fontSize * 1.5;
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

  // value interpolation with react-spring
  const [interpolatedSample, setInterpolatedSample] = useState(100);

  useEffect(() => {
    requestAnimationFrame(() => {
      textRef &&
        drawPixelatedText(ctx, textRef, Number(interpolatedSample.toFixed(1)));
    });
  }, [textRef, children, fontSize, fontFamily, interpolatedSample]);

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
      <motion.div
        className={styles.canvasContainer}
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        {isSpringy ? (
          <>
            <Spring to={{ number: sample }}>
              {props => {
                setInterpolatedSample(props.number);
                return null;
              }}
            </Spring>

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
            />
          </>
        ) : (
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
          />
        )}
      </motion.div>
      <h1 ref={setTextRef} style={{ display: "none" }}>
        {children}
      </h1>
    </div>
  );
};

export default Ditherer;
