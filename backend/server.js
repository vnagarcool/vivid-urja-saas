const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://vinod:YOUR_PASSWORD@cluster0.etal4.mongodb.net/solar")
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err))

const LeadSchema = new mongoose.Schema({
    name: String,
    phone: String,
    city: String,
    status: String,
    time: Date
})

const Lead = mongoose.model("Lead", LeadSchema)

app.post("/api/leads", async (req,res)=>{
    const newLead = new Lead({
        ...req.body,
        status: "New",
        time: new Date()
    })

    await newLead.save()

    res.json({message:"Saved in DB"})
})

app.get("/api/leads", async (req,res)=>{
    const leads = await Lead.find().sort({time:-1})
    res.json(leads)
})

app.listen(5000, ()=> console.log("Server running"))
