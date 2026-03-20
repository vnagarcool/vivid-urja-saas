let leads = []

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
