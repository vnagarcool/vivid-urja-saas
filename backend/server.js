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
  city:String
});

// SAVE LEAD
app.post("/api/leads", async (req,res)=>{
  const lead=new Lead(req.body);
  await lead.save();
  res.json({msg:"Saved"});
});

// GET LEADS
app.get("/api/leads", auth, async (req,res)=>{
  const data=await Lead.find();
  res.json(data);
});

app.listen(10000,()=>console.log("Server Running 🚀"));
