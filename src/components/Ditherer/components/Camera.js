import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

const WebcamComponent = ({ onRef, hide, ...props }) => {
  const webcamRef = useRef();
  const [cameraReady, setCameraReady] = useState(false);
  const setupCamera = async () => {
    // MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const e1 =
        "Browser API navigator.mediaDevices.getUserMedia not available";
      this.setState({ error_messages: e1 });
      throw e1;
    }

    const video = webcamRef.current.video;
    video.onloadedmetadata = () => {
      setCameraReady(true);
    };
  };

  useEffect(() => {
    setupCamera();
  }, [webcamRef]);

  if (cameraReady) {
    onRef && onRef(webcamRef);
  }

  return (
    <Webcam
      audio={false}
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      style={{ display: !hide ? "block" : "none" }}
      {...props}
    />
  );
};

export default WebcamComponent;
