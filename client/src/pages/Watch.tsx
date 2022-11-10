import * as React from "react";
import { Navigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useMediaQuery } from "@mantine/hooks";
import { Paper, Grid, Flex, Textarea, Button, Stack } from "@mantine/core";

import { useSessionStore } from "../store";

const WatchPage: React.FC = () => {
  const session = useSessionStore();
  const mobile = useMediaQuery("(max-width: 600px)");

  const video = React.useRef<HTMLVideoElement>(null);

  const createPeerToPeerConnection = React.useCallback(() => {
    const _peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.stunprotocol.org" }] });
    _peer.addEventListener("track", handleTrackEvent);
    _peer.addEventListener("negotiationneeded", () => handleNegotationNeededEvent(_peer));
    return _peer;
  }, []);

  React.useEffect(() => {
    const peer = createPeerToPeerConnection();
    peer.addTransceiver("video", { direction: "recvonly" });
  }, [createPeerToPeerConnection]);

  const handleNegotationNeededEvent = async (_peer: RTCPeerConnection) => {
    const offer = await _peer.createOffer();
    await _peer.setLocalDescription(offer);
    const payload = { sdp: _peer.localDescription };
    try {
      const res = await axios.post("http://localhost:5000/watch", payload);

      const desc = new RTCSessionDescription(res.data.sdp);
      _peer.setRemoteDescription(desc).catch((error) => console.log(error));
    } catch (e) {
      const error = e as AxiosError;
      console.log(error.response ? error.response.data : error.message);
    }
  };

  const handleTrackEvent = (e: RTCTrackEvent) => {
    if (video.current) video.current.srcObject = e.streams[0];
  };

  if (!session.isSessionInitialized) return <Navigate to="/" />;

  return (
    <Paper mih="100vh">
      <Grid mih="100vh" gutter={0}>
        <Grid.Col span={mobile ? 12 : 8} bg="black">
          <video ref={video} height="99%" width="100%" autoPlay></video>
        </Grid.Col>
        <Grid.Col span={mobile ? 12 : 4}>
          <Flex direction="column" h="100%">
            <Flex bg="gray.2" direction="column" sx={{ flexGrow: 1 }}></Flex>
            <Stack py="lg" px="lg" bg="gray.5">
              <Textarea placeholder="Type message" autosize minRows={2} maxRows={4} />
              <Button fullWidth>Send</Button>
            </Stack>
          </Flex>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

export default WatchPage;
