const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connect
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// 🔐 LOGIN API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "vinod@123") {
    res.json({ token: "secure123" });
  } else {
    res.status(401).json({ message: "Invalid Login ❌" });
  }
});

// ✅ Schema
const LeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  city: String,
  status: { type: String, default: "New" },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model("Lead", LeadSchema);

// ✅ Save Lead
app.post("/api/leads", async (req, res) => {
  const lead = new Lead(req.body);
  await lead.save();
  res.json({ message: "Lead Saved ✅" });
});

// ✅ Get All Leads
app.get("/api/leads", async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
});

// ✅ Update Status + Notes
app.put("/api/leads/:id", async (req, res) => {
  await Lead.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated ✅" });
});

// ✅ Delete Lead
app.delete("/api/leads/:id", async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted ✅" });
});

// 🚀 Server
app.listen(10000, () => console.log("Server running 🚀"));
