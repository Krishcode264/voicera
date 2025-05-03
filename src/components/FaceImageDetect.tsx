import  { useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useFaceModels } from "../hooks/useFaceModals";
import { FaceDetectorProp } from "../types";

const FaceImageDetect = ({ setMode }: FaceDetectorProp) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {  } = useFaceModels();
  const [selectImage, setSelectImage] = useState(false);
  const handleImage = async () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const { width, height } = img;
    canvas.width = width;
    canvas.height = height;

    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resized = faceapi.resizeResults(detections, { width, height });
    resized.forEach((result) => {
      const { age, gender, genderProbability, expressions, detection } = result;
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

    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceLandmarks(canvas, resized);
    faceapi.draw.drawFaceExpressions(canvas, resized);
  };

  return (
    <div className="p-4">
      <button
        onClick={() => {
          setMode("");
        }}
        className="mx-auto  absolute top-4 left-4 hover:scale-105 hover:shadow-lg cursor-pointer  my-auto px-2 py-1 text-white text-2xl rounded-sm font-medium bg-violet-600"
      >
        close
      </button>

      {!selectImage && (
        <>
          <button
            onClick={() => {
              inputRef.current?.click();
            }}
            className="mx-auto  hover:scale-105 hover:shadow-lg cursor-pointer  my-auto px-3 py-1 text-white text-2xl rounded-sm font-medium bg-violet-600"
          >
            select Image
          </button>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(e) => {
              console.log("onchnage run")
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  if (imgRef.current) {
                    setSelectImage(true);
                    imgRef.current.src = reader.result as string;
                  }
                };
                reader.readAsDataURL(file);
                setSelectImage(true)
              }
            }}
          />
        </>
      )}
      {selectImage && (
        <div style={{ position: "relative" }}>
          <img
            ref={imgRef}
            onLoad={handleImage}
            style={{ width: "100%", maxWidth: "600px" }}
            alt="Uploaded"
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FaceImageDetect;
