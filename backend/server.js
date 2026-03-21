const admins = [
  { username: "admin", password: "1234" },
  { username: "vinod", password: "vinod@123" }
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = admins.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    res.json({ token: "secure123", user: username });
  } else {
    res.status(401).json({ message: "Invalid Login ❌" });
  }
});
