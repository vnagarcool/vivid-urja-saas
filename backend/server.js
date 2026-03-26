const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 ENV
const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";
const MONGO_URI = process.env.MONGO_URI;

// 🔗 MongoDB connect
mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// 📦 Models
const Lead = mongoose.model("Lead", {
  name: String,
  phone: String,
  city: String,
  status: { type: String, default: "New" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", {
  email: String,
  password: String,
  role: String
});

// 🔐 Middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
}

// 🚀 ROUTES

// Register
app.post("/api/register", async (req, res) => {
  const { email, password, role } = req.body;
  const user = new User({ email, password, role });
  await user.save();
  res.json({ msg: "User created" });
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
  res.json({ token });
});

// ➕ Add Lead
app.post("/api/leads", async (req, res) => {
  const lead = new Lead(req.body);
  await lead.save();
  res.json(lead);
});

// 📊 Get Leads (NO AUTH for now)
app.get("/api/leads", async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
});

// ❌ Delete Lead
app.delete("/api/leads/:id", async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

// 🚀 START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server Running 🚀"));
