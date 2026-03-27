const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "supersecret123";

// 🔗 MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected ✅"))
.catch(err=> console.log(err));

// 📦 Models
const User = mongoose.model("User", {
  email: String,
  password: String,
  role: String
});

const Lead = mongoose.model("Lead", {
  name: String,
  phone: String,
  city: String,
  status: String
});

// 🔐 Register
app.post("/api/register", async (req, res) => {
  const { email } = req.body;

  const exist = await User.findOne({ email });
  if (exist) return res.json({ msg: "User exists" });

  const user = new User(req.body);
  await user.save();

  res.json({ msg: "User created" });
});

// 🔐 Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (!user) return res.json({ msg: "Invalid login" });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);

  res.json({ token, role: user.role });
});

// 🔒 Middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ msg: "No token" });

  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded;
  next();
}

// ➕ Add Lead
app.post("/api/leads", auth, async (req, res) => {
  const lead = new Lead({
    name: req.body.name,
    phone: req.body.phone,
    city: req.body.city,
    status: "New"
  });

  await lead.save();
  res.json({ msg: "Lead added" });
});

// 📋 Get Leads
app.get("/api/leads", auth, async (req, res) => {
  const leads = await Lead.find();
  res.json(leads);
});

// ❌ Delete Lead
app.delete("/api/leads/:id", auth, async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

// 🌐 Root
app.get("/", (req, res) => {
  res.send("VIVID URJA SERVER RUNNING 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log("Server Running 🚀"));
