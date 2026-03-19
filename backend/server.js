const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
  res.send("API running 🚀")
})

app.post("/api/leads", (req,res)=>{
  console.log(req.body)
  res.json({message:"Lead saved"})
})

app.listen(5000, ()=> console.log("Server running"))