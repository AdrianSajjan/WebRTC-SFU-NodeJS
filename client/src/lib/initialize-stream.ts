import { MediaType } from "../interfaces/enum";
import { getMedia } from "./get-media";

export const initializeStream = async (type: MediaType, config: MediaStreamConstraints, video: HTMLVideoElement) => {
  const stream = await getMedia(type, config);
  video.srcObject = stream;
  return stream;
};
