import React, { useRef, useEffect } from "react";

const Canvas = ({
  onContext,
  contextType = "2d",
  mirrored,
  letterSpacing,
  ...rest
}) => {
  const canvasRef = useRef();

  useEffect(() => {
    if (canvasRef && onContext) {
      console.log("spacing:", letterSpacing);
      const can = canvasRef.current;
      can.style.letterSpacing = `${letterSpacing}px`;
      const ctx = can.getContext(contextType);

      ctx.centreFillRect = function(x, y, width, height) {
        this.fillRect(x - width / 2, y - height / 2, width, height);
      };

      onContext(ctx);
    }
  }, [canvasRef, onContext, contextType, letterSpacing]);

  return (
    <canvas
      {...rest}
      style={{ transform: mirrored ? "scale(-1,1)" : "scale(1)" }}
      ref={canvasRef}
    />
  );
};

export default Canvas;
