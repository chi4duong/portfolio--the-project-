// server/server.js
// Simple Express server that serves the client and exposes /roll-dices

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from ../client
const clientDir = path.join(__dirname, "..", "client");
app.use(express.static(clientDir));


 //GET /roll-dices

app.get("/roll-dices", (req, res) => {
  const count = Math.max(1, Math.min(20, parseInt(req.query.count, 10) || 5));
  const values = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6));

  //  Log every request in the terminal
  console.log(`Dice roll requested — Count: ${count} | Values: [${values.join(", ")}]`);

  res.json({ values, count, timestamp: new Date().toISOString() });
});


// For direct navigations in SPA-style, fall back to index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Yatzy server running at http://localhost:${PORT}`);
  console.log(`Open that URL and click "Roll Dice" to fetch /roll-dices`);
});
