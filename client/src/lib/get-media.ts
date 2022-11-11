import { MediaType } from "../interfaces/enum";

export const getMedia = async (type: MediaType, config: MediaStreamConstraints) => {
  let stream: MediaStream;
  switch (type) {
    case MediaType.User:
      stream = await navigator.mediaDevices.getUserMedia(config);
      break;
    case MediaType.Screen:
      stream = await navigator.mediaDevices.getDisplayMedia(config);
      break;
  }
  return stream;
};
