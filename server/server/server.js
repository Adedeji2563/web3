const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const BotSchema = new mongoose.Schema({
  token: String,
  script: String,
});
const Bot = mongoose.model("Bot", BotSchema);

// Deploy Bot
app.post("/deploy", async (req, res) => {
  const { token, script } = req.body;

  if (!token || !script) return res.status(400).send("Missing token or script");

  const bot = new Bot({ token, script });
  await bot.save();

  exec(`pm2 start ${script} --name bot-${token}`, (err) => {
    if (err) return res.status(500).send("Failed to start bot");
    res.send("Bot deployed successfully!");
  });
});

// Stop Bot
app.post("/stop", async (req, res) => {
  const { token } = req.body;
  exec(`pm2 stop bot-${token}`, (err) => {
    if (err) return res.status(500).send("Failed to stop bot");
    res.send("Bot stopped successfully!");
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
