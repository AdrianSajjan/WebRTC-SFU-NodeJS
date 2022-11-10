import axios, { AxiosError } from "axios";
import * as React from "react";
import { Navigate } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import { Paper, Grid, Flex, Button, Stack } from "@mantine/core";

import { useSessionStore } from "../store";

const StreamPage: React.FC = () => {
  const session = useSessionStore();
  const mobile = useMediaQuery("(max-width: 600px)");

  const video = React.useRef<HTMLVideoElement>(null);
  const stream = React.useRef<MediaStream | null>(null);
  const peer = React.useRef<RTCPeerConnection | null>(null);
  const recorder = React.useRef<MediaRecorder | null>(null);
  const handle = React.useRef<NodeJS.Timeout | null>(null);

  const [isInitialized, setInitialized] = React.useState(false);
  const [currentMode, setCurrentMode] = React.useState(0);

  const initializeVideoStream = async () => {
    if (!video.current) return;

    const _stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.current.srcObject = _stream;

    setCurrentMode(1);
    stream.current = _stream;

    handlePeerToPeerSharing(_stream);
    initializeVideoRecorder(_stream);
  };

  const createPeerToPeerConnection = () => {
    const _peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.stunprotocol.org" }] });
    _peer.addEventListener("negotiationneeded", () => handleNegotationNeededEvent(_peer));
    return _peer;
  };

  const recordVideoAsChunks = (_recorder: MediaRecorder) => {
    _recorder.start();
    handle.current = setTimeout(() => {
      try {
        _recorder.stop();
      } catch (error) {}
    }, 5000);
  };

  const initializeVideoRecorder = (_stream: MediaStream) => {
    const _recorder = new MediaRecorder(_stream, { mimeType: "video/webm; codecs=vp9" });
    recordVideoAsChunks(_recorder);
    _recorder.addEventListener("dataavailable", (event) => {
      const data: Blob = event.data;
      if (!(data.size > 0)) return;
      if (stream.current !== null) recordVideoAsChunks(_recorder);
      const body = new FormData();
      body.append("buffer", data);
      axios
        .post("http://localhost:5000/save-chunks", body, {
          headers: { "Content-Type": "multipart/form-data" },
          params: { uuid: session.uuid },
        })
        .catch((error: AxiosError) => console.log(error));
    });
    recorder.current = _recorder;
  };

  const handlePeerToPeerSharing = (_stream: MediaStream) => {
    if (!isInitialized || !peer.current) {
      const _peer = createPeerToPeerConnection();
      _stream.getTracks().forEach((track) => _peer.addTrack(track, _stream));
      peer.current = _peer;
      setInitialized(true);
    } else {
      _stream.getTracks().forEach((track) => peer.current!.addTrack(track, _stream));
    }
  };

  const initializeScreenStream = async () => {
    if (!video.current) return;

    const _stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
    video.current.srcObject = _stream;

    setCurrentMode(2);
    stream.current = _stream;

    handlePeerToPeerSharing(_stream);
  };

  const handleNegotationNeededEvent = async (_peer: RTCPeerConnection) => {
    const offer = await _peer.createOffer();
    await _peer.setLocalDescription(offer);
    const payload = { sdp: _peer.localDescription };
    try {
      const res = await axios.post("http://localhost:5000/stream", payload);
      const desc = new RTCSessionDescription(res.data.sdp);
      _peer.setRemoteDescription(desc).catch((error) => console.log(error));
    } catch (e) {
      const error = e as AxiosError;
      console.log(error.response ? error.response.data : error.message);
    }
  };

  const stopStreaming = () => {
    if (!isInitialized || !stream.current) return;
    if (recorder.current) recorder.current.stop();
    if (handle.current) clearTimeout(handle.current);
    stream.current.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setCurrentMode(0);
  };

  if (!session.isSessionInitialized) return <Navigate to="/" />;

  return (
    <Paper mih="100vh">
      <Grid mih="100vh" gutter={0}>
        <Grid.Col span={mobile ? 12 : 8} bg="black">
          <video muted height="calc(100% - 10px)" width="100%" autoPlay ref={video}></video>
        </Grid.Col>
        <Grid.Col span={mobile ? 12 : 4}>
          <Flex direction="column" h="100%">
            <Flex bg="gray.2" px="lg" py="lg" direction="column" sx={{ flexGrow: 1 }}></Flex>
            {currentMode === 0 ? (
              <Stack py="lg" px="lg" bg="gray.5">
                <Button fullWidth onClick={initializeVideoStream}>
                  Start Streaming Video
                </Button>
                <Button fullWidth onClick={initializeScreenStream}>
                  Start Streaming Screen
                </Button>
              </Stack>
            ) : (
              <Stack py="lg" px="lg" bg="gray.5">
                <Button color="red" fullWidth onClick={stopStreaming}>
                  Stop Streaming {currentMode === 1 ? "Video" : "Screen"}
                </Button>
              </Stack>
            )}
          </Flex>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

export default StreamPage;
