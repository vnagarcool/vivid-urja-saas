let leads = [mongodb+srv://GreatStacks:<db_password>@cluster0.etal4.mongodb.net/?appName=Cluster0]

app.post("/api/leads", (req,res)=>{
  leads.push({
    ...req.body,
    status: "New",
    time: new Date()
  })
  res.json({message:"Lead saved"})
})

app.get("/api/leads", (req,res)=>{
  res.json(leads)
})
