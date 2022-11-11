export const stopStreaming = (stream: MediaStream, recorder: MediaRecorder, interval: NodeJS.Timer, video: HTMLVideoElement) => {
  if (!stream) return;
  if (recorder && recorder.state !== "inactive") recorder.stop();
  if (interval) clearInterval(interval);
  if (video) video.srcObject = null;
  stream.getTracks().forEach((track) => track.stop());
};
