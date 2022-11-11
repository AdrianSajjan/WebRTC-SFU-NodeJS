import { handleNegotationNeededEvent } from "./handle-negotations";

export const createPeerConnection = (): RTCPeerConnection => {
  const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.stunprotocol.org" }] });
  peer.addEventListener("negotiationneeded", () => handleNegotationNeededEvent(peer));
  return peer;
};
