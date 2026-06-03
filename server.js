const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("Audio Post AI API Running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "audio-post-normalizer"
  });
});

app.post("/normalize", upload.single("audio"), (req, res) => {
  try {
    const preset = req.body.preset || "tv";

    if (!req.file) {
      return res.status(400).json({
        error: "No audio file uploaded"
      });
    }

    const inputPath = req.file.path;
    const outputPath = `${inputPath}-normalized.wav`;

    let loudnorm;

    if (preset === "digital") {
      loudnorm = "loudnorm=I=-14:TP=-1:LRA=11";
    } else {
      loudnorm = "loudnorm=I=-24:TP=-2:LRA=7";
    }

    const command = `ffmpeg -i "${inputPath}" -af "${loudnorm}" -y "${outputPath}"`;

    exec(command, (error) => {
      if (error) {
        console.error(error);

        return res.status(500).json({
          error: "FFmpeg processing failed"
        });
      }

      res.download(outputPath, "normalized.wav", () => {
        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
