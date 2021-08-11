import { Results } from "@mediapipe/holistic";

export interface FrameData {
  frame: ImageData;
  results: Results;
}

export interface GIFEncoder {
  setDelay: (ms: number) => void;
  setRepeat: (iter: number) => void;
  setSize: (w: number, h: number) => void;
  start: () => void;
  finish: () => void;
  stream: () => ByteArray;
  addFrame: (im: ImageData | OffscreenCanvasRenderingContext2D, is_imageData: boolean) => boolean;
}

interface ByteArray {
  bin: number[];
}