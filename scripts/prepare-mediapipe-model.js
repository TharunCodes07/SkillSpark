import fs from "fs";
import path from "path";
import https from "https";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const ROOT = process.cwd();
const MODEL_PATH = path.join(ROOT, "face_landmarker.task");
const ASSETS_DIR = path.join(ROOT, "android/app/src/main/assets");
const ASSET_PATH = path.join(ASSETS_DIR, "face_landmarker.task");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error("Failed to download model"));
        return;
      }
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    });
  });
}

(async () => {
  if (!fs.existsSync(MODEL_PATH)) {
    console.log("⬇️ Downloading MediaPipe model...");
    await download(MODEL_URL, MODEL_PATH);
  }

  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  fs.copyFileSync(MODEL_PATH, ASSET_PATH);

  const sizeMB = fs.statSync(ASSET_PATH).size / (1024 * 1024);
  if (sizeMB < 3.5) {
    throw new Error("Model file corrupted (size mismatch)");
  }

  console.log("✅ MediaPipe model ready:", sizeMB.toFixed(2), "MB");
})();
