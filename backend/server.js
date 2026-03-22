const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// DB
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("DB Connected"));

// MODEL
const Lead = mongoose.model("Lead",{
name:String,
phone:String,
city:String,
createdAt:{type:Date,default:Date.now}
});

// LOGIN
app.post("/api/login",(req,res)=>{
if(req.body.username==="admin" && req.body.password==="1234"){
res.json({token:"ok"});
}else res.status(401).json({msg:"Wrong"});
});

// SAVE LEAD
app.post("/api/leads", async (req,res)=>{
const lead = new Lead(req.body);
await lead.save();
res.json({msg:"Saved"});
});

// GET LEADS
app.get("/api/leads", async (req,res)=>{
const data = await Lead.find().sort({createdAt:-1});
res.json(data);
});

// DELETE
app.delete("/api/leads/:id", async (req,res)=>{
await Lead.findByIdAndDelete(req.params.id);
res.json({msg:"Deleted"});
});

app.listen(10000,()=>console.log("Server Running"));
