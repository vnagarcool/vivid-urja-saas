const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "vivid_secret";

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

// 📝 REGISTER DEALER
app.post("/api/register", async(req,res)=>{
  const user = new User(req.body);
  await user.save();
  res.json({msg:"Dealer Created"});
});

// 🔐 LOGIN
app.post("/api/login", async(req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email,password});
  if(!user) return res.status(401).json({msg:"Invalid"});

  const token = jwt.sign({
    id:user._id,
    role:user.role
  }, SECRET);

  res.json({token,role:user.role});
});

// 📥 SAVE LEAD (PUBLIC FORM)
app.post("/api/leads", async(req,res)=>{
  const lead = new Lead({
    name:req.body.name,
    phone:req.body.phone,
    city:req.body.city,
    dealerId:"public"
  });

  await lead.save();

  console.log("New Lead:",req.body.phone); // WhatsApp future

  res.json({msg:"Saved"});
});

// 📊 GET LEADS (ROLE BASED)
app.get("/api/leads", auth, async(req,res)=>{

  let leads;

  if(req.user.role==="admin"){
    leads = await Lead.find().sort({createdAt:-1});
  }else{
    leads = await Lead.find({dealerId:req.user.id});
  }

  res.json(leads);
});

// 🚀 START
app.listen(5000,()=>console.log("Server Running 🚀"));
