import cors from "cors";
import webrtc from "wrtc";
import morgan from "morgan";
import fs from "fs/promises";
import express from "express";

import upload from "./lib/multer";

let senderStream: MediaStream;

const app = express();

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/save-chunks", upload.single("buffer"), async (req, res) => {
  if (!req.file) {
    console.log("File not writeable to disk");
    return res.status(500).json({ message: "Unable to save file tp disk" });
  }

  try {
    const temp = `${req.file.destination}/${req.file.filename}`;
    const data = await fs.readFile(temp);
    const file = `./data/${req.query.uuid}.webm`;

    try {
      await fs.access(file);
      await fs.appendFile(file, data);
    } catch (e) {
      await fs.writeFile(file, data);
    }

    await fs.unlink(temp);
    await fs.rmdir(req.file.destination);

    res.json(req.file);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.post("/watch", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection({ iceServers: [{ urls: "stun:stun.stunprotocol.org" }] });
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);
  senderStream.getTracks().forEach((track) => peer.addTrack(track, senderStream));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = {
    sdp: peer.localDescription,
  };
  res.json(payload);
});

app.post("/stream", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection({ iceServers: [{ urls: "stun:stun.stunprotocol.org" }] });
  peer.addEventListener("track", (e: RTCTrackEvent) => handleTrackEvent(e, peer));
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = {
    sdp: peer.localDescription,
  };
  res.json(payload);
});

function handleTrackEvent(e: RTCTrackEvent, _peer: RTCPeerConnection) {
  senderStream = e.streams[0];
}

app.listen(5000, () => console.log("Server is running on PORT 5000"));
