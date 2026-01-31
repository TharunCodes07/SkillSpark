const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");
const https = require("https");

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download model: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

module.exports = function withFaceLandmarkerAsset(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      const tmpModelPath = path.join(
        projectRoot,
        "face_landmarker.task"
      );

      const assetsDir = path.join(
        projectRoot,
        "android/app/src/main/assets"
      );

      const finalModelPath = path.join(
        assetsDir,
        "face_landmarker.task"
      );

      fs.mkdirSync(assetsDir, { recursive: true });

      // 🔥 Download model if missing (EAS-safe)
      if (!fs.existsSync(tmpModelPath)) {
        console.log("⬇️ Downloading MediaPipe face_landmarker.task...");
        await download(MODEL_URL, tmpModelPath);
      }

      fs.copyFileSync(tmpModelPath, finalModelPath);

      const sizeMB =
        fs.statSync(finalModelPath).size / (1024 * 1024);

      if (sizeMB < 3.5) {
        throw new Error("❌ Downloaded model is corrupted");
      }

      console.log(
        `✅ MediaPipe model ready (${sizeMB.toFixed(2)} MB)`
      );

      return config;
    },
  ]);
};
