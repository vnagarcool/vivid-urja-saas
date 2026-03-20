const mongoose = require("mongoose");

mongoose.connect("YOUR_MONGODB_URL")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())

// ✅ MongoDB Connection
mongoose.connect("mongodb+srv://vinod:YOUR_PASSWORD@cluster0.etal4.mongodb.net/solar")
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err))

// ✅ Schema
const LeadSchema = new mongoose.Schema({
    name: String,
    phone: String,
    city: String,
    status: String,
    time: Date
})

// ✅ Model
const Lead = mongoose.model("Lead", LeadSchema)

// ✅ Save Lead
app.post("/api/leads", async (req,res)=>{
    try{
        const newLead = new Lead({
            ...req.body,
            status: "New",
            time: new Date()
        })

        await newLead.save()

        res.json({message:"Lead saved"})
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

// ✅ Get Leads
app.get("/api/leads", async (req,res)=>{
    const leads = await Lead.find().sort({time:-1})
    res.json(leads)
})

// ✅ PORT FIX (IMPORTANT 🔥)
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log("Server running on port " + PORT)
})
