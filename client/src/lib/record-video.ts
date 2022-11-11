import { AxiosError } from "axios";
import api from "../config/api";

export const initializeRecorder = (stream: MediaStream, options: MediaRecorderOptions, params: any) => {
  const recorder = new MediaRecorder(stream, options);
  recorder.addEventListener("dataavailable", (event) => handleOnDataAvailable(event, params));
  recorder.start();
  return recorder;
};

export const recordVideoAsChunks = (recorder: MediaRecorder, interval: number) => {
  return setInterval(() => {
    recorder.requestData();
  }, interval);
};

const handleOnDataAvailable = (event: BlobEvent, params: any) => {
  const data = event.data;
  if (data.size === 0) return;
  const body = new FormData();
  body.append("buffer", data);
  console.log("Sending Chunk");
  console.log(data);
  api
    .post("/save-chunks", body, { params })
    .then(() => console.log("Saved chunk to server"))
    .catch((error: AxiosError) => console.log(error));
};
