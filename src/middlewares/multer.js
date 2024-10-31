import multer from "multer";
import os from "os";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use /tmp in production (like on Render) and ./public/temporary locally
    const directory =
      process.env.NODE_ENV === "production"
        ? os.tmpdir()
        : "./public/temporary";
    cb(null, directory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
