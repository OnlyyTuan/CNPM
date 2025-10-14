const express = require("express");
const db = require("./db");
const cors = require("cors");

const app = express();

app.use(cors()); // <--- cho phép Frontend truy cập
app.use(express.json());

/* -------------------- LOCATION -------------------- */
app.get("/locations", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Location");
  res.json(rows);
});
app.get("/locations/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Location WHERE id=?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});
app.post("/locations", async (req, res) => {
  const { id, name, address, latitude, longitude, type, estimatedTime } =
    req.body;
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

/* -------------------- DRIVER -------------------- */
app.get("/drivers", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Driver");
  res.json(rows);
});
app.get("/drivers/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Driver WHERE id=?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});
app.post("/drivers", async (req, res) => {
  const { id, name, phone, licenseNumber, experience, status, currentBus_id } =
    req.body;
  await db.query(
    "INSERT INTO Driver (id,name,phone,licenseNumber,experience,status,currentBus_id) VALUES (?,?,?,?,?,?,?)",
    [id, name, phone, licenseNumber, experience, status, currentBus_id]
  );
  res.json({ id, name });
});
app.put("/drivers/:id", async (req, res) => {
  const { name, phone, licenseNumber, experience, status, currentBus_id } =
    req.body;
  await db.query(
    "UPDATE Driver SET name=?,phone=?,licenseNumber=?,experience=?,status=?,currentBus_id=? WHERE id=?",
    [
      name,
      phone,
      licenseNumber,
      experience,
      status,
      currentBus_id,
      req.params.id,
    ]
  );
  res.json({ id: req.params.id, name });
});
app.delete("/drivers/:id", async (req, res) => {
  await db.query("DELETE FROM Driver WHERE id=?", [req.params.id]);
  res.json({ message: `Driver ${req.params.id} deleted` });
});

/* -------------------- BUS -------------------- */
app.get("/buses", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Bus");
  res.json(rows);
});
app.get("/buses/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Bus WHERE id=?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});
app.post("/buses", async (req, res) => {
  const {
    id,
    capacity,
    currentLocation_id,
    status,
    speed,
    lastUpdate,
    route_id,
    driver_id,
  } = req.body;
  await db.query(
    "INSERT INTO Bus (id,capacity,currentLocation_id,status,speed,lastUpdate,route_id,driver_id) VALUES (?,?,?,?,?,?,?,?)",
    [
      id,
      capacity,
      currentLocation_id,
      status,
      speed,
      lastUpdate,
      route_id,
      driver_id,
    ]
  );
  res.json({ id, status });
});
app.put("/buses/:id", async (req, res) => {
  const {
    capacity,
    currentLocation_id,
    status,
    speed,
    lastUpdate,
    route_id,
    driver_id,
  } = req.body;
  await db.query(
    "UPDATE Bus SET capacity=?,currentLocation_id=?,status=?,speed=?,lastUpdate=?,route_id=?,driver_id=? WHERE id=?",
    [
      capacity,
      currentLocation_id,
      status,
      speed,
      lastUpdate,
      route_id,
      driver_id,
      req.params.id,
    ]
  );
  res.json({ id: req.params.id, status });
});
app.delete("/buses/:id", async (req, res) => {
  await db.query("DELETE FROM Bus WHERE id=?", [req.params.id]);
  res.json({ message: `Bus ${req.params.id} deleted` });
});

/* -------------------- ROUTE -------------------- */
app.get("/routes", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Route");
  res.json(rows);
});
app.get("/routes/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Route WHERE id=?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});
app.post("/routes", async (req, res) => {
  const { id, name, estimatedDuration, distance, startTime, endTime } =
    req.body;
  await db.query(
    "INSERT INTO Route (id,name,estimatedDuration,distance,startTime,endTime) VALUES (?,?,?,?,?,?)",
    [id, name, estimatedDuration, distance, startTime, endTime]
  );
  res.json({ id, name });
});
app.put("/routes/:id", async (req, res) => {
  const { name, estimatedDuration, distance, startTime, endTime } = req.body;
  await db.query(
    "UPDATE Route SET name=?,estimatedDuration=?,distance=?,startTime=?,endTime=? WHERE id=?",
    [name, estimatedDuration, distance, startTime, endTime, req.params.id]
  );
  res.json({ id: req.params.id, name });
});
app.delete("/routes/:id", async (req, res) => {
  await db.query("DELETE FROM Route WHERE id=?", [req.params.id]);
  res.json({ message: `Route ${req.params.id} deleted` });
});

/* -------------------- STUDENT -------------------- */
app.get("/students", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Student");
  res.json(rows);
});
app.get("/students/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Student WHERE id=?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});
app.post("/students", async (req, res) => {
  const {
    id,
    name,
    className,
    grade,
    parentContact,
    status,
    assignedBus_id,
    pickupLocation_id,
    dropoffLocation_id,
  } = req.body;
  await db.query(
    "INSERT INTO Student (id,name,class,grade,parentContact,status,assignedBus_id,pickupLocation_id,dropoffLocation_id) VALUES (?,?,?,?,?,?,?,?,?)",
    [
      id,
      name,
      className,
      grade,
      parentContact,
      status,
      assignedBus_id,
      pickupLocation_id,
      dropoffLocation_id,
    ]
  );
  res.json({ id, name });
});
app.put("/students/:id", async (req, res) => {
  const {
    name,
    className,
    grade,
    parentContact,
    status,
    assignedBus_id,
    pickupLocation_id,
    dropoffLocation_id,
  } = req.body;
  await db.query(
    "UPDATE Student SET name=?,class=?,grade=?,parentContact=?,status=?,assignedBus_id=?,pickupLocation_id=?,dropoffLocation_id=? WHERE id=?",
    [
      name,
      className,
      grade,
      parentContact,
      status,
      assignedBus_id,
      pickupLocation_id,
      dropoffLocation_id,
      req.params.id,
    ]
  );
  res.json({ id: req.params.id, name });
});
app.delete("/students/:id", async (req, res) => {
  await db.query("DELETE FROM Student WHERE id=?", [req.params.id]);
  res.json({ message: `Student ${req.params.id} deleted` });
});

/* -------------------- SCHEDULE -------------------- */
app.get("/schedules", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Schedule");
  res.json(rows);
});
app.get("/schedules/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Schedule WHERE id=?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});
app.post("/schedules", async (req, res) => {
  const { id, date, time, status, bus_id, driver_id, route_id } = req.body;
  await db.query(
    "INSERT INTO Schedule (id,date,time,status,bus_id,driver_id,route_id) VALUES (?,?,?,?,?,?,?)",
    [id, date, time, status, bus_id, driver_id, route_id]
  );
  res.json({ id, status });
});
app.put("/schedules/:id", async (req, res) => {
  const { date, time, status, bus_id, driver_id, route_id } = req.body;
  await db.query(
    "UPDATE Schedule SET date=?,time=?,status=?,bus_id=?,driver_id=?,route_id=? WHERE id=?",
    [date, time, status, bus_id, driver_id, route_id, req.params.id]
  );
  res.json({ id: req.params.id, status });
});
app.delete("/schedules/:id", async (req, res) => {
  await db.query("DELETE FROM Schedule WHERE id=?", [req.params.id]);
  res.json({ message: `Schedule ${req.params.id} deleted` });
});

/* -------------------- MESSAGE -------------------- */
app.get("/messages", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Message");
  res.json(rows);
});
app.get("/messages/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Message WHERE id=?", [
    req.params.id,
  ]);
  res.json(rows[0]);
});
app.post("/messages", async (req, res) => {
  const {
    sender_type,
    sender_id,
    recipient_id,
    message_content,
    timestamp,
    is_read,
  } = req.body;
  await db.query(
    "INSERT INTO Message (sender_type,sender_id,recipient_id,message_content,timestamp,is_read) VALUES (?,?,?,?,?,?)",
    [sender_type, sender_id, recipient_id, message_content, timestamp, is_read]
  );
  res.json({ recipient_id, message_content });
});
app.put("/messages/:id", async (req, res) => {
  const {
    sender_type,
    sender_id,
    recipient_id,
    message_content,
    timestamp,
    is_read,
  } = req.body;
  await db.query(
    "UPDATE Message SET sender_type=?,sender_id=?,recipient_id=?,message_content=?,timestamp=?,is_read=? WHERE id=?",
    [
      sender_type,
      sender_id,
      recipient_id,
      message_content,
      timestamp,
      is_read,
      req.params.id,
    ]
  );
  res.json({ id: req.params.id, message_content });
});
app.delete("/messages/:id", async (req, res) => {
  await db.query("DELETE FROM Message WHERE id=?", [req.params.id]);
  res.json({ message: `Message ${req.params.id} deleted` });
});

/* -------------------- ROUTE_STOP -------------------- */
app.get("/route_stops", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Route_Stop");
  res.json(rows);
});
app.get("/route_stops/:route_id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Route_Stop WHERE route_id=?", [
    req.params.route_id,
  ]);
  res.json(rows);
});
app.post("/route_stops", async (req, res) => {
  const { route_id, location_id, stop_order } = req.body;
  await db.query(
    "INSERT INTO Route_Stop (route_id,location_id,stop_order) VALUES (?,?,?)",
    [route_id, location_id, stop_order]
  );
  res.json({ route_id, location_id, stop_order });
});
app.put("/route_stops/:route_id/:location_id", async (req, res) => {
  const { stop_order } = req.body;
  await db.query(
    "UPDATE Route_Stop SET stop_order=? WHERE route_id=? AND location_id=?",
    [stop_order, req.params.route_id, req.params.location_id]
  );
  res.json({
    route_id: req.params.route_id,
    location_id: req.params.location_id,
    stop_order,
  });
});
app.delete("/route_stops/:route_id/:location_id", async (req, res) => {
  await db.query("DELETE FROM Route_Stop WHERE route_id=? AND location_id=?", [
    req.params.route_id,
    req.params.location_id,
  ]);
  res.json({
    message: `Route_Stop ${req.params.route_id}-${req.params.location_id} deleted`,
  });
});

/* -------------------- SCHEDULE_STUDENT -------------------- */
app.get("/schedule_students", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Schedule_Student");
  res.json(rows);
});
app.get("/schedule_students/:schedule_id", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM Schedule_Student WHERE schedule_id=?",
    [req.params.schedule_id]
  );
  res.json(rows);
});
app.post("/schedule_students", async (req, res) => {
  const { schedule_id, student_id, pickup_status } = req.body;
  await db.query(
    "INSERT INTO Schedule_Student (schedule_id,student_id,pickup_status) VALUES (?,?,?)",
    [schedule_id, student_id, pickup_status]
  );
  res.json({ schedule_id, student_id, pickup_status });
});
app.put("/schedule_students/:schedule_id/:student_id", async (req, res) => {
  const { pickup_status } = req.body;
  await db.query(
    "UPDATE Schedule_Student SET pickup_status=? WHERE schedule_id=? AND student_id=?",
    [pickup_status, req.params.schedule_id, req.params.student_id]
  );
  res.json({
    schedule_id: req.params.schedule_id,
    student_id: req.params.student_id,
    pickup_status,
  });
});
app.delete("/schedule_students/:schedule_id/:student_id", async (req, res) => {
  await db.query(
    "DELETE FROM Schedule_Student WHERE schedule_id=? AND student_id=?",
    [req.params.schedule_id, req.params.student_id]
  );
  res.json({
    message: `Schedule_Student ${req.params.schedule_id}-${req.params.student_id} deleted`,
  });
});

/* -------------------- LOCATIONLOG -------------------- */
app.get("/location_logs", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM LocationLog");
  res.json(rows);
});
app.get("/location_logs/:bus_id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM LocationLog WHERE bus_id=?", [
    req.params.bus_id,
  ]);
  res.json(rows);
});
app.post("/location_logs", async (req, res) => {
  const { bus_id, timestamp, latitude, longitude, speed } = req.body;
  await db.query(
    "INSERT INTO LocationLog (bus_id,timestamp,latitude,longitude,speed) VALUES (?,?,?,?,?)",
    [bus_id, timestamp, latitude, longitude, speed]
  );
  res.json({ bus_id, timestamp });
});
app.put("/location_logs/:id", async (req, res) => {
  const { timestamp, latitude, longitude, speed } = req.body;
  await db.query(
    "UPDATE LocationLog SET timestamp=?,latitude=?,longitude=?,speed=? WHERE id=?",
    [timestamp, latitude, longitude, speed, req.params.id]
  );
  res.json({ id: req.params.id });
});
app.delete("/location_logs/:id", async (req, res) => {
  await db.query("DELETE FROM LocationLog WHERE id=?", [req.params.id]);
  res.json({ message: `LocationLog ${req.params.id} deleted` });
});
app.get("/", (req, res) => {
  res.send(
    "<h1>Server Smart School Bus đang chạy!</h1><p>Sử dụng các endpoint API: /locations, /drivers, ...</p>"
  );
});
/* -------------------- SCHEDULES WITH ROUTES -------------------- */
// Backend: index.js / app.js
app.get("/schedules-with-routes", async (req, res) => {
  const [rows] = await db.query(
    `SELECT s.id as schedule_id, s.date, s.time, s.status as schedule_status,
            b.id as bus_id, b.status as bus_status,
            d.id as driver_id, d.name as driver_name,
            r.id as route_id, r.name as route_name
     FROM Schedule s
     JOIN Bus b ON s.bus_id = b.id
     JOIN Driver d ON s.driver_id = d.id
     JOIN Route r ON s.route_id = r.id`
  );
  res.json(rows);
});

/* -------------------- START SERVER -------------------- */
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
