import { Dispatch, SetStateAction } from "react"


export type mediaType="cam"|"image"|""
export type  FaceDetectorProp={
    setMode:Dispatch<SetStateAction<mediaType>>
}