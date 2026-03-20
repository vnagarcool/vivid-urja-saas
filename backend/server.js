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

// ✅ SAVE LEAD
app.post("/api/leads", async (req,res)=>{
    try{
        const newLead = new Lead({
            ...req.body,
            status: "New",
            time: new Date()
        })

        await newLead.save()

        res.json({message:"Lead saved in DB"})
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

// ✅ GET LEADS
app.get("/api/leads", async (req,res)=>{
    const leads = await Lead.find().sort({time:-1})
    res.json(leads)
})

app.listen(5000, ()=> console.log("Server running"))
