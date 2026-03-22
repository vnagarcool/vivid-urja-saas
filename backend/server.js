const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http,{cors:{origin:"*"}});

app.use(cors());
app.use(express.json());

const SECRET = "vivid_secret";

// DB
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB Connected"));

// MODELS
const User = mongoose.model("User",{email:String,password:String});
const Lead = mongoose.model("Lead",{
name:String,
phone:String,
city:String,
createdAt:{type:Date,default:Date.now}
});

// REGISTER
app.post("/api/register", async (req,res)=>{
const hash = await bcrypt.hash(req.body.password,10);
await User.create({email:req.body.email,password:hash});
res.json({msg:"Registered"});
});

// LOGIN
app.post("/api/login", async (req,res)=>{
const user = await User.findOne({email:req.body.email});
if(!user) return res.status(401).json({msg:"Invalid"});

const valid = await bcrypt.compare(req.body.password,user.password);
if(!valid) return res.status(401).json({msg:"Wrong"});

const token = jwt.sign({id:user._id},SECRET);
res.json({token});
});

// AUTH
function auth(req,res,next){
try{
req.user = jwt.verify(req.headers.authorization,SECRET);
next();
}catch{
res.status(401).json({msg:"Unauthorized"});
}
}

// SAVE LEAD
app.post("/api/leads", async (req,res)=>{
const lead = await Lead.create(req.body);

// REAL-TIME
io.emit("new-lead");

res.json({msg:"Saved"});
});

// GET LEADS
app.get("/api/leads", auth, async (req,res)=>{
const data = await Lead.find().sort({createdAt:-1});
res.json(data);
});

// DELETE
app.delete("/api/leads/:id", async (req,res)=>{
await Lead.findByIdAndDelete(req.params.id);
res.json({msg:"Deleted"});
});

http.listen(10000,()=>console.log("Server Running 🚀"));
