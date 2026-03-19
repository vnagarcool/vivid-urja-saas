const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

// Dummy Admin (for now)
const admin = {
  email: "admin@solar.com",
  password: "123456"
}

// LOGIN API
app.post("/api/login", (req,res)=>{
  const {email, password} = req.body

  if(email === admin.email && password === admin.password){
    return res.json({success:true, token:"dummy-token"})
  } else {
    return res.status(401).json({success:false, message:"Invalid login"})
  }
})

// LEADS API
app.post("/api/leads", (req,res)=>{
  console.log(req.body)
  res.json({message:"Lead saved"})
})

app.get("/", (req,res)=>{
  res.send("API running 🚀")
})

app.listen(5000, ()=> console.log("Server running"))
