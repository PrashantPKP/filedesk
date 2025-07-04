const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const fileRoutes = require("./routes/files");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
// Set your MongoDB Atlas connection string in backend/.env as MONGODB_URI
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/files", fileRoutes);

app.get("/", (req, res) => {
  res.send("✅ FileDesk backend is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
