import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Spring } from "react-spring/renderprops";

import Canvas from "./components/Canvas";
import { remap, pixellateText } from "./components/Pixellation";
import useMousePos from "../utils/useMousePos";

import styles from "./Pixellator.module.css";

const Ditherer = ({
  children,
  fontSize = 90,
  fontFamily = "Lexend Deca",
  pixelSize = 100,
  minSize = 20,
  maxSize = 100,
  springy,
  mouseDriven,
  inverted,
  color
}) => {
  // mouse driven events
  const mousePos = useMousePos();
  const mousePosSample = Math.round(
    Math.max(
      Math.round(remap(mousePos.x, 0, window.innerWidth, minSize, maxSize)),
      10
    ) / 10
  ); // should not go below 10

  let sample = mouseDriven ? mousePosSample : Math.max(pixelSize, 1);

  // text that you're getting input from
  const [textRef, setTextRef] = useState(null);
  // canvas context
  const [ctx, setCtx] = useState();

  // value interpolation with react-spring
  const [interpolatedSample, setInterpolatedSample] = useState(100);

  useEffect(() => {
    const f = requestAnimationFrame(() => {
      textRef &&
        pixellateText(
          ctx,
          textRef.innerHTML,
          springy ? interpolatedSample : sample,
          {
            fontSize: fontSize,
            fontFamily: fontFamily
          },
          color
        );
    });

    return () => cancelAnimationFrame(f);
  }, [
    textRef,
    children,
    fontSize,
    ctx,
    interpolatedSample,
    pixelSize,
    color,
    fontFamily,
    sample,
    springy
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
      <motion.div
        className={styles.canvasContainer}
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        {springy ? (
          <>
            <Spring to={{ number: sample }}>
              {props => {
                setInterpolatedSample(props.number);
                return null;
              }}
            </Spring>

            <Canvas
              className={
                inverted
                  ? color
                    ? styles.canvasColorOutInverted
                    : styles.canvasOutInverted
                  : color
                  ? styles.canvasColorOut
                  : styles.canvasOut
              }
              onContext={setCtx}
            />
          </>
        ) : (
          <Canvas
            className={
              inverted
                ? color
                  ? styles.canvasColorOutInverted
                  : styles.canvasOutInverted
                : color
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

Ditherer.propTypes = {
  children: PropTypes.element.isRequired,
  fontSize: PropTypes.number,
  fontFamily: PropTypes.string,
  pixelSize: PropTypes.number,
  minSize: PropTypes.number,
  maxSize: PropTypes.number,
  springy: PropTypes.bool,
  mouseDriven: PropTypes.bool,
  inverted: PropTypes.bool,
  color: PropTypes.bool
};

export default Ditherer;
