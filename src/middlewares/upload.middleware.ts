import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env";

export const UPLOADS_PATH = env.UPLOADS_PATH;

const SUBDIRS = ["videos", "ads"] as const;
type UploadSubdir = (typeof SUBDIRS)[number];

SUBDIRS.forEach((dir) => {
  try {
    fs.mkdirSync(path.join(UPLOADS_PATH, dir), { recursive: true });
  } catch (err) {
    console.error(`Error creating upload directory '${dir}':`, err);
    process.exit(1);
  }
});

function createUpload(
  subdir: UploadSubdir,
  mimeCheck: (mime: string) => boolean,
  errorMsg: string
) {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) =>
        cb(null, path.join(UPLOADS_PATH, subdir)),
      filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (mimeCheck(file.mimetype)) return cb(null, true);
      const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
      err.message = errorMsg;
      cb(err);
    },
  });
}

const upload = createUpload(
  "videos",
  (mime) => mime.startsWith("video/"),
  "Solo se permiten archivos de video (mp4, avi, mov, etc.)"
);

export default upload;

export const uploadAdMedia = createUpload(
  "ads",
  (mime) => mime.startsWith("image/") || mime.startsWith("video/"),
  "Solo se permiten archivos de imagen o video"
);
