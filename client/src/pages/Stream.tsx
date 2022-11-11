import * as uuid from "uuid";
import * as React from "react";
import { Navigate } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import { Paper, Grid, Flex, Button, Stack } from "@mantine/core";

import { useSessionStore } from "../store";
import { MediaType } from "../interfaces/enum";
import { stopStreaming } from "../lib/stop-stream";
import { initializeStream } from "../lib/initialize-stream";
import { handlePeerToPeerSharing } from "../lib/peer-sharing";
import { initializeRecorder, recordVideoAsChunks } from "../lib/record-video";

const StreamPage: React.FC = () => {
  const session = useSessionStore();
  const mobile = useMediaQuery("(max-width: 600px)");

  const video = React.useRef<HTMLVideoElement>(null);
  const stream = React.useRef<MediaStream | null>(null);
  const recorder = React.useRef<MediaRecorder | null>(null);
  const handle = React.useRef<NodeJS.Timeout | null>(null);

  const [isStreaming, setStreaming] = React.useState(false);

  const start = async (type: MediaType) => {
    if (!video.current) return;
    stream.current = await initializeStream(type, { audio: true, video: true }, video.current);
    handlePeerToPeerSharing(stream.current);
    recorder.current = initializeRecorder(stream.current, { mimeType: "video/webm; codecs=vp9" }, { uuid: uuid.v4() });
    handle.current = recordVideoAsChunks(recorder.current, 5000);
    setStreaming(true);
  };

  const stop = () => {
    stopStreaming(stream.current!, recorder.current!, handle.current!, video.current!);
    setStreaming(false);
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
            {!isStreaming ? (
              <Stack py="lg" px="lg" bg="gray.5">
                <Button fullWidth onClick={() => start(MediaType.User)}>
                  Start Streaming Video
                </Button>
                <Button fullWidth onClick={() => start(MediaType.Screen)}>
                  Start Streaming Screen
                </Button>
              </Stack>
            ) : (
              <Stack py="lg" px="lg" bg="gray.5">
                <Button color="red" fullWidth onClick={stop}>
                  Stop Streaming
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
