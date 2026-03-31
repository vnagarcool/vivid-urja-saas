const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const PDFDocument=require("pdfkit");

const app=express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

const User=mongoose.model("User",{email:String,password:String,role:String});
const Lead=mongoose.model("Lead",{name:String,phone:String,city:String,status:{type:String,default:"New"}});

// LOGIN
app.post("/api/login",async(req,res)=>{
const user=await User.findOne({email:req.body.email});
const ok=await bcrypt.compare(req.body.password,user.password);
if(!ok) return res.json({msg:"Invalid"});
const token=jwt.sign({id:user._id,role:user.role},"secret");
res.json({token,role:user.role});
});

// LEADS
app.post("/api/leads",async(req,res)=>{
await Lead.create(req.body);
console.log("🔥 New Lead:",req.body.phone);
res.json({msg:"ok"});
});

app.get("/api/leads",async(req,res)=>{
res.json(await Lead.find());
});

// PDF
app.get("/api/quote/:id",async(req,res)=>{
const l=await Lead.findById(req.params.id);
const doc=new PDFDocument();
res.setHeader("Content-Type","application/pdf");
doc.pipe(res);
doc.text("Solar Quote");
doc.text(l.name);
doc.end();
});

// AI CHAT
app.post("/api/chat",(req,res)=>{
let m=req.body.message;
let r="We will help you install solar system ☀️";
if(m.includes("price")) r="Starts ₹2L";
res.json({reply:r});
});

// AUTO FOLLOWUP
setInterval(async ()=>{
let leads=await Lead.find({status:"New"});
leads.forEach(l=>console.log("Followup:",l.phone));
},60000);

app.listen(5000);
