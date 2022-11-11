declare module "wrtc" {
  export const MediaStream: MediaStream;
  export const MediaStreamTrack: MediaStreamTrack;
  export const RTCDataChannel: RTCDataChannel;
  export const RTCDataChannelEvent: RTCDataChannelEvent;
  export const RTCDtlsTransport: RTCDtlsTransport;
  export const RTCIceCandidate: RTCIceCandidate;
  export const RTCIceTransport: RTCIceTransport;
  export const RTCPeerConnection: new (constraint: RTCConfiguration) => RTCPeerConnection;
  export const RTCPeerConnectionIceEvent: RTCPeerConnectionIceEvent;
  export const RTCRtpReceiver: RTCRtpReceiver;
  export const RTCRtpSender: RTCRtpSender;
  export const RTCRtpTransceiver: RTCRtpTransceiver;
  export const RTCSctpTransport: RTCSctpTransport;
  export const RTCSessionDescription: {
    new (descriptionInitDict: RTCSessionDescriptionInit): RTCSessionDescription;
    prototype: RTCSessionDescription;
  };
}
