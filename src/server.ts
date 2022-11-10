import cors from "cors";
import webrtc from "wrtc";
import express from "express";
import morgan from "morgan";
import multer from "multer";
import bodyParser from "body-parser";
import fs from "fs";
import * as uuid from "uuid";

let senderStream: MediaStream;

const app = express();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const directory = `./data/${req.query.uuid}`;
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      cb(null, directory);
    },
    filename: (req, file, cb) => {
      cb(null, uuid.v4());
    },
  }),
});

app.use(cors());
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/save-chunks", upload.single("buffer"), async (req, res) => {
  console.log(req.file);
  res.send("Saved");
});

app.post("/watch", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection({ iceServers: [{ urls: "stun:stun.stunprotocol.org" }] });
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);
  senderStream?.getTracks().forEach((track) => peer.addTrack(track, senderStream));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = {
    sdp: peer.localDescription,
  };

  res.json(payload);
});

app.post("/stream", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection({ iceServers: [{ urls: "stun:stun.stunprotocol.org" }] });
  peer.ontrack = (e: RTCTrackEvent) => handleTrackEvent(e, peer);
  const desc = new webrtc.RTCSessionDescription(body.sdp);
  await peer.setRemoteDescription(desc);
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const payload = {
    sdp: peer.localDescription,
  };
  res.json(payload);
});

function handleTrackEvent(e: RTCTrackEvent, peer: RTCPeerConnection) {
  console.log("Handle Track event");
  console.log(e.streams);
  senderStream = e.streams[0];
}

app.listen(5000, () => console.log("Server is running on PORT 5000"));
