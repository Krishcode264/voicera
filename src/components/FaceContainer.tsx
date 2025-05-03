import { useState } from "react";
import FaceCamDetector from "./FaceCamDetector";
import FaceImageDetector from "./FaceImageDetect";
import { mediaType } from "../types";

const FaceContainer = () => {
  const [mode, setMode] = useState<mediaType>("");

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4 ">
      {mode === "" && (
        <div className="flex gap-4  w-[60%] h-[50%] bg-violet-100 rounded-xl   items-center justify-center shadow-xl ">
          <button
            className="bg-violet-600 text-white px-4 py-2 my-auto   hover:cursor-pointer  rounded hover:scale-105"
            onClick={() => setMode("cam")}
          >
            Use Webcam
          </button>
          <button
            className="bg-violet-600 text-white px-4 py-2  md:my-auto hover:cursor-pointer rounded hover:scale-105"
            onClick={() => setMode("image")}
          >
            Upload Image
          </button>
        </div>
      )}
      {mode === "cam" && <FaceCamDetector setMode={setMode} />}
      {mode === "image" && <FaceImageDetector  setMode={setMode}/>}
    </div>
  );
};

export default FaceContainer;
