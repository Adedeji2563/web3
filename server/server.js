require("dotenv").config(); // Load environment variables early

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
app.use(cors());

// Ensure MONGO_URI is set
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not set in environment variables!");
  process.exit(1); // Exit to prevent a broken connection
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Define a root route to avoid "Cannot GET /" issue
app.get("/", (req, res) => {
  res.send("🚀 Server is running! Use /deploy or /stop to manage bots.");
});

const BotSchema = new mongoose.Schema({
  token: String,
  script: String,
});
const Bot = mongoose.model("Bot", BotSchema);

// Deploy Bot
app.post("/deploy", async (req, res) => {
  const { token, script } = req.body;

  if (!token || !script) {
    return res.status(400).json({ error: "Missing token or script" });
  }

  const bot = new Bot({ token, script });
  await bot.save();

  exec(`pm2 start ${script} --name bot-${token}`, (err) => {
    if (err) {
      console.error("❌ Failed to start bot:", err);
      return res.status(500).json({ error: "Failed to start bot" });
    }
    res.json({ message: "✅ Bot deployed successfully!" });
  });
});

// Stop Bot
app.post("/stop", async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  exec(`pm2 stop bot-${token}`, (err) => {
    if (err) {
      console.error("❌ Failed to stop bot:", err);
      return res.status(500).json({ error: "Failed to stop bot" });
    }
    res.json({ message: "✅ Bot stopped successfully!" });
  });
});

// Use the correct port for Render
const PORT = process.env.PORT || 10000; // Render free plan might use dynamic ports
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
