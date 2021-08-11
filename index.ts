import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { FACEMESH_TESSELATION, HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS, Results } from "@mediapipe/holistic";

import CyclicalFixedArray from "./cyclical-fixed-array";
import { FrameData } from "./models";

const videoElement = document.getElementById('input_video') as HTMLVideoElement;
const canvasElement = document.getElementById('output_canvas') as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext('2d');

const frames = new CyclicalFixedArray<FrameData>(60 * 60);
const gifWorker = new Worker('gif_worker.ts');
gifWorker.postMessage({ type: 'gif:setOptions', width: 1280, height: 720 })

let isRecording = true;

gifWorker.addEventListener('message', ({ data }) => {
  switch (data.type) {
    case 'gif:url':
      frames.reset();
      isRecording = true;
      download(data.url);
      break;
    default: throw new Error(`unexpected message type: ${data.type}`)
  }
});


function onResults(results: Results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height);
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
    { color: '#00FF00', lineWidth: 4 });
  drawLandmarks(canvasCtx, results.poseLandmarks,
    { color: '#FF0000', lineWidth: 2 });
  drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
    { color: '#C0C0C070', lineWidth: 1 });
  drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
    { color: '#CC0000', lineWidth: 5 });
  drawLandmarks(canvasCtx, results.leftHandLandmarks,
    { color: '#00FF00', lineWidth: 2 });
  drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
    { color: '#00CC00', lineWidth: 5 });
  drawLandmarks(canvasCtx, results.rightHandLandmarks,
    { color: '#FF0000', lineWidth: 2 });

  const frame = canvasCtx.getImageData(0, 0, 1280, 720);
  frames.add({ frame, results: { ...results, image: undefined } });
  canvasCtx.restore();
}

const holistic = new Holistic({ locateFile: (fileName) => `holistic/${fileName}` });
holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
holistic.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});
camera.start();


function download(url: string) {
  const a = document.createElement("a");
  a.download = "download.gif";
  a.href = url;
  a.click();

  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 10000);
}

setTimeout(() => {
  isRecording = false;
  gifWorker.postMessage({ type: 'gif:addFrames', frames: frames.filter(() => true) });
}, 10000);