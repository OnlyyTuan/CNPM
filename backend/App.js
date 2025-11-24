const express = require("express");
const db = require("./db");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import GPS Tracking Routes
const gpsTrackingRoutes = require('./routes/gpsTracking');

// Use GPS Tracking Routes
app.use('/api/gps', gpsTrackingRoutes);

/* -------------------- EXISTING ROUTES -------------------- */
// Location Routes
app.get("/locations", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Location");
  res.json(rows);
});

app.get("/locations/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Location WHERE id=?", [req.params.id]);
  res.json(rows[0]);
});

app.post("/locations", async (req, res) => {
  const { id, name, address, latitude, longitude, type, estimatedTime } = req.body;
  await db.query(
    "INSERT INTO Location (id,name,address,latitude,longitude,type,estimatedTime) VALUES (?,?,?,?,?,?,?)",
    [id, name, address, latitude, longitude, type, estimatedTime]
  );
  res.json({ id, name });
});

app.put("/locations/:id", async (req, res) => {
  const { name, address, latitude, longitude, type, estimatedTime } = req.body;
  await db.query(
    "UPDATE Location SET name=?,address=?,latitude=?,longitude=?,type=?,estimatedTime=? WHERE id=?",
    [name, address, latitude, longitude, type, estimatedTime, req.params.id]
  );
  res.json({ id: req.params.id, name });
});

app.delete("/locations/:id", async (req, res) => {
  await db.query("DELETE FROM Location WHERE id=?", [req.params.id]);
  res.json({ message: `Location ${req.params.id} deleted` });
});

// [Giữ nguyên các routes khác: drivers, buses, routes, students, schedules...]
// Driver, Bus, Route, Student, Schedule, Message, Route_Stop, Schedule_Student, LocationLog routes...

app.get("/", (req, res) => {
  res.send(
    "<h1>Server Smart School Bus đang chạy!</h1><p>GPS Tracking API: /api/gps/*</p>"
  );
});

// Start Server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));