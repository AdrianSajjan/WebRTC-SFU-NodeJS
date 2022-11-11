import { createPeerConnection } from "./create-peer-connection";

export const handlePeerToPeerSharing = (stream: MediaStream) => {
  const peer = createPeerConnection();
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));
};
