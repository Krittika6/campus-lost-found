const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");



dotenv.config();

const app = express();
app.use(cors({
  origin:"https://campus-lost-found-brown.vercel.app",
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cors());
const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("Campus Lost & Found API Running...");
});
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const itemRoutes = require("./routes/itemRoutes");
app.use("/api/items", itemRoutes);
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));
