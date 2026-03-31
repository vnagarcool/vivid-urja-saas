const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const jwt=require("jsonwebtoken");

const app=express();
app.use(express.json());
app.use(cors());

const JWT_SECRET="secret123";

mongoose.connect(process.env.MONGO_URI);

const User=mongoose.model("User",{
email:String,
password:String,
role:String
});

const Lead=mongoose.model("Lead",{
name:String,
phone:String,
city:String,
status:{type:String,default:"New"}
});

// AUTH
function auth(req,res,next){
const token=req.headers.authorization;
if(!token) return res.json({msg:"No token"});

try{
const d=jwt.verify(token.split(" ")[1],JWT_SECRET);
req.user=d;
next();
}catch{
res.json({msg:"Invalid token"});
}
}

// LOGIN
app.post("/api/login",async(req,res)=>{
const u=await User.findOne({email:req.body.email});
if(!u || u.password!==req.body.password)
return res.json({msg:"Invalid"});

const token=jwt.sign({id:u._id,role:u.role},JWT_SECRET);
res.json({token,role:u.role});
});

// LEADS
app.post("/api/leads",async(req,res)=>{
await Lead.create(req.body);
res.json({msg:"Added"});
});

app.get("/api/leads",auth,async(req,res)=>{
res.json(await Lead.find());
});

app.put("/api/leads/:id",auth,async(req,res)=>{
await Lead.findByIdAndUpdate(req.params.id,req.body);
res.json({msg:"Updated"});
});

app.delete("/api/leads/:id",auth,async(req,res)=>{
await Lead.findByIdAndDelete(req.params.id);
res.json({msg:"Deleted"});
});

// NOTIFICATIONS
let notifications=[];
app.get("/api/notify",(req,res)=>res.json(notifications));

app.listen(5000,()=>console.log("Server running"));
