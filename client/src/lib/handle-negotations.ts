import { AxiosError } from "axios";
import api from "../config/api";

export const handleNegotationNeededEvent = async (peer: RTCPeerConnection) => {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = { sdp: peer.localDescription };
  try {
    const res = await api.post("/stream", payload);
    const desc = new RTCSessionDescription(res.data.sdp);
    peer.setRemoteDescription(desc).catch((error) => console.log(error));
  } catch (e) {
    const error = e as AxiosError;
    console.log(error.response ? error.response.data : error.message);
  }
};
