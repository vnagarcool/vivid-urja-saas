const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const PDFDocument=require("pdfkit");

const app=express();
app.use(express.json());
app.use(cors());

const JWT_SECRET="secret123";

mongoose.connect(process.env.MONGO_URI);

// MODELS
const User=mongoose.model("User",{email:String,password:String,role:String});
const Lead=mongoose.model("Lead",{name:String,phone:String,city:String,status:{type:String,default:"New"}});

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

// REGISTER
app.post("/api/register",async(req,res)=>{
const hash=await bcrypt.hash(req.body.password,10);
await User.create({...req.body,password:hash});
res.json({msg:"Created"});
});

// LOGIN
app.post("/api/login",async(req,res)=>{
const user=await User.findOne({email:req.body.email});
if(!user) return res.json({msg:"Invalid"});

const match=await bcrypt.compare(req.body.password,user.password);
if(!match) return res.json({msg:"Wrong password"});

const token=jwt.sign({id:user._id,role:user.role},JWT_SECRET,{expiresIn:"1d"});
res.json({token,role:user.role});
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

// PDF
app.get("/api/quote/:id",async(req,res)=>{
const lead=await Lead.findById(req.params.id);
const doc=new PDFDocument();
res.setHeader("Content-Type","application/pdf");
doc.pipe(res);
doc.text("VIVID URJA QUOTE");
doc.text("Name: "+lead.name);
doc.text("Phone: "+lead.phone);
doc.text("City: "+lead.city);
doc.text("System: 5kW");
doc.text("Price: ₹2.5L");
doc.end();
});

// NOTIFICATIONS
let notifications=[];
app.get("/api/notify",(req,res)=>res.json(notifications));

app.listen(5000,()=>console.log("Server running 🚀"));
