const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB Connected ✅"))
.catch(err=>console.log(err));

// LOGIN
app.post("/api/login", (req,res)=>{
  const {username,password} = req.body;

  if(username==="admin" && password==="1234"){
    res.json({token:"secure123", user:"admin"});
  } else {
    res.status(401).json({msg:"Invalid"});
  }
});

// AUTH
function auth(req,res,next){
  if(req.headers.authorization==="secure123"){
    next();
  } else {
    res.status(401).json({msg:"Unauthorized"});
  }
}

// SCHEMA
const Lead = mongoose.model("Lead",{
  name:String,
  phone:String,
  city:String,
  createdAt:{type:Date,default:Date.now}
});

// SAVE LEAD
app.post("/api/leads", async (req,res)=>{
  const lead=new Lead(req.body);
  await lead.save();
  res.json({msg:"Saved"});
});

// GET LEADS
app.get("/api/leads", auth, async (req,res)=>{
  const data=await Lead.find().sort({createdAt:-1});
  res.json(data);
});

// DELETE
app.delete("/api/leads/:id", async (req,res)=>{
  await Lead.findByIdAndDelete(req.params.id);
  res.json({msg:"Deleted"});
});

// SIMPLE AI CHAT (upgrade later GPT)
app.post("/api/chat", async (req,res)=>{
  const msg=req.body.message.toLowerCase();

  let reply="Please share your mobile number";

  if(msg.includes("price")) reply="₹80,000 से start होता है";
  if(msg.includes("subsidy")) reply="₹95,000 subsidy available है";

  res.json({reply});
});

app.listen(10000,()=>console.log("Server Running 🚀"));
