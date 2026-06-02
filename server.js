const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Audio Post AI API Running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "audio-post-normalizer"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
