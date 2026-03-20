const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 MongoDB Connect
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// 🔥 Schema
const LeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  city: String,
  status: { type: String, default: "New" },
  createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model("Lead", LeadSchema);

// 🔥 Save Lead
app.post("/api/leads", async (req, res) => {
  const lead = new Lead(req.body);
  await lead.save();
  res.json({ message: "Lead Saved ✅" });
});

// 🔥 Get Leads
app.get("/api/leads", async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
});

// Root
app.get("/", (req, res) => {
  res.send("VIVID URJA API RUNNING 🚀");
});

app.listen(10000, () => console.log("Server running"));
