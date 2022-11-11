import fs from "fs";
import multer from "multer";
import * as uuid from "uuid";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const directory = `./data/${req.query.uuid}`;
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      cb(null, directory);
    },
    filename: (_req, _file, cb) => {
      cb(null, uuid.v4());
    },
  }),
});

export default upload;
