require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 ENV
const SECRET = process.env.JWT_SECRET;

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// 👤 USER MODEL
const User = mongoose.model("User",{
  name:String,
  email:String,
  password:String,
  role:{type:String,default:"dealer"}
});

// 📊 LEAD MODEL
const Lead = mongoose.model("Lead",{
  name:String,
  phone:String,
  city:String,
  status:{type:String,default:"New"},
  dealerId:String,
  createdAt:{type:Date,default:Date.now}
});

// 🔐 AUTH
function auth(req,res,next){
  const token = req.headers.authorization;
  if(!token) return res.status(401).json({msg:"No token"});

  try{
    const decoded = jwt.verify(token,SECRET);
    req.user = decoded;
    next();
  }catch{
    res.status(401).json({msg:"Invalid token"});
  }
}

// 📝 REGISTER (SECURE)
app.post("/api/register", async(req,res)=>{
  try{
    const hashed = await bcrypt.hash(req.body.password,10);

    const user = new User({
      name:req.body.name,
      email:req.body.email,
      password:hashed,
      role:"dealer"
    });

    await user.save();
    res.json({msg:"Dealer Created"});
  }catch(err){
    res.status(500).json({msg:"Error"});
  }
});

// 🔐 LOGIN (SECURE)
app.post("/api/login", async(req,res)=>{
  try{
    const {email,password} = req.body;

    const user = await User.findOne({email});
    if(!user) return res.status(401).json({msg:"Invalid"});

    const match = await bcrypt.compare(password,user.password);
    if(!match) return res.status(401).json({msg:"Wrong password"});

    const token = jwt.sign({
      id:user._id,
      role:user.role
    }, SECRET);

    res.json({token,role:user.role});
  }catch(err){
    res.status(500).json({msg:"Error"});
  }
});

// 📥 SAVE LEAD (AUTO ASSIGN RANDOM DEALER 🔥)
app.post("/api/leads", async(req,res)=>{
  try{

    const dealers = await User.find({role:"dealer"});

    let assignedDealer = "public";

    if(dealers.length > 0){
      const random = dealers[Math.floor(Math.random()*dealers.length)];
      assignedDealer = random._id;
    }

    const lead = new Lead({
      name:req.body.name,
      phone:req.body.phone,
      city:req.body.city,
      dealerId:assignedDealer
    });

    await lead.save();

    console.log("New Lead:",req.body.phone);

    res.json({msg:"Saved"});
  }catch(err){
    res.status(500).json({msg:"Error"});
  }
});

// 📊 GET LEADS (ROLE BASED)
app.get("/api/leads", auth, async(req,res)=>{
  try{

    let leads;

    if(req.user.role==="admin"){
      leads = await Lead.find().sort({createdAt:-1});
    }else{
      leads = await Lead.find({dealerId:req.user.id});
    }

    res.json(leads);

  }catch(err){
    res.status(500).json({msg:"Error"});
  }
});

// 🚀 START
app.listen(5000,()=>console.log("Server Running 🚀"));
