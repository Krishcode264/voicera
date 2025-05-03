import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useFaceModels } from "../hooks/useFaceModals";
import { FaceDetectorProp } from "../types";

const FaceCamDetector = ({ setMode }: FaceDetectorProp) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraStarted, setCameraStarted] = useState(false);
  const {modelsLoaded  } = useFaceModels();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera error:", error);
      }
    };

    if (modelsLoaded) {
      startCamera();
    }
  }, [modelsLoaded]);

  useEffect(() => {
    let intervalId: number;

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const { width, height } = video.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      const resized = faceapi.resizeResults(detections, { width, height });

      const context = canvas.getContext("2d");
      if (context) context.clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
      faceapi.draw.drawFaceExpressions(canvas, resized);

      resized.forEach((result) => {
        const { age, gender, genderProbability, expressions, detection } =
          result;
        const expression = Object.entries(expressions || {}).sort(
          (a, b) => b[1] - a[1]
        )[0][0];
        const drawText = new faceapi.draw.DrawTextField(
          [
            `${Math.round(age)} yrs`,
            `${gender} (${(genderProbability * 100).toFixed(0)}%)`,
            `Expression: ${expression}`,
          ],
          detection.box.bottomLeft
        );
        drawText.draw(canvas);
      });
    };

    const startDetection = () => {
      if (cameraStarted) {
        intervalId = window.setInterval(detectFaces, 1000);
      }
    };

    startDetection();
    return () => clearInterval(intervalId);
  }, [cameraStarted]);

  return (
    <div className="w-full">
      <button
        onClick={() => {
          setMode("");
        }}
        className=" z-40  absolute top-4 left-4 hover:scale-105 hover:shadow-lg cursor-pointer   px-2 py-1 text-white text-2xl rounded-sm font-medium bg-violet-600"
      >
        close
      </button>
      <div className="relative w-full max-w-3xl mx-auto ">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-xl"
          onPlaying={() => setCameraStarted(true)}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
    </div>
  );
};

export default FaceCamDetector;
