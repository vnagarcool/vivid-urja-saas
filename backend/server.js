const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB Connected ✅"))
.catch(err=>console.log(err));

// 🔐 Dummy Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    res.json({ token: "secure123", user: "admin" });
  } else {
    res.status(401).json({ message: "Invalid ❌" });
  }
});

// 🛡️ Auth Middleware
function auth(req,res,next){
  if(req.headers.authorization==="secure123"){
    next();
  } else {
    res.status(401).json({message:"Unauthorized"});
  }
}

// 📊 Schema
const LeadSchema = new mongoose.Schema({
  name:String,
  phone:String,
  city:String,
  status:{type:String,default:"New"},
  createdAt:{type:Date,default:Date.now}
});

const Lead = mongoose.model("Lead", LeadSchema);

// 🤖 AI Score
function score(l){
  let s=0;
  if(l.city==="Jaipur") s+=30;
  if(l.status==="Interested") s+=50;
  return s;
}

// ➕ Add Lead
app.post("/api/leads", async (req,res)=>{
  const lead=new Lead(req.body);
  await lead.save();
  res.json({msg:"Saved"});
});

// 📥 Get Leads
app.get("/api/leads", auth, async (req,res)=>{
  const leads=await Lead.find().sort({createdAt:-1});
  const updated=leads.map(l=>({...l._doc,score:score(l)}));
  res.json(updated);
});

// ❌ Delete
app.delete("/api/leads/:id", async (req,res)=>{
  await Lead.findByIdAndDelete(req.params.id);
  res.json({msg:"Deleted"});
});

// 🚀 Server
app.listen(10000,()=>console.log("Server Running 🚀"));
