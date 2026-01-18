const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); // Import bcrypt

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pubudu_health",
});

db.connect((err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("MySQL Connected...");
});

// --- AUTH ROUTES ---

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      const user = result[0];
      // Compare hashed password
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Don't send password back
        delete user.password;
        res.json(user);
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ message: "User not found" });
    }
  });
});

// Register (Generic)
app.post("/api/register", async (req, res) => {
  const { email, password, role, firstName, lastName, phone, specialty } =
    req.body;

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql =
      "INSERT INTO users (email, password, role, first_name, last_name, phone, specialty) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(
      sql,
      [email, hashedPassword, role, firstName, lastName, phone, specialty],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({
          id: result.insertId,
          email,
          role,
          first_name: firstName,
          last_name: lastName,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Hashing failed" });
  }
});

// --- DATA ROUTES ---

// Get Users by Role
app.get("/api/users", (req, res) => {
  const role = req.query.role;
  const sql =
    "SELECT id, email, first_name, last_name, role, specialty, phone FROM users WHERE role = ?";
  db.query(sql, [role], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Delete User
app.delete("/api/users/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User deleted" });
  });
});

// Update Profile
app.put("/api/users/:id", (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const sql = "UPDATE users SET first_name=?, last_name=?, phone=? WHERE id=?";
  db.query(sql, [firstName, lastName, phone, req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
});

// --- APPOINTMENT ROUTES ---

// Get Appointments (Filter by Doctor or Patient)
app.get("/api/appointments", (req, res) => {
  const { userId, role } = req.query;
  let sql = "SELECT * FROM appointments";
  let params = [];

  // Allow fetching ALL if no filter provided (for Admin)
  if (role === "doctor") {
    sql += " WHERE doctor_id = ?";
    params.push(userId);
  } else if (role === "patient") {
    sql += " WHERE patient_id = ?";
    params.push(userId);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Create Appointment
app.post("/api/appointments", (req, res) => {
  const { patientId, doctorId, patientName, doctorName, date } = req.body;
  const sql =
    "INSERT INTO appointments (patient_id, doctor_id, patient_name, doctor_name, date_time, status) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [patientId, doctorId, patientName, doctorName, date, "Pending"],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Appointment Booked" });
    }
  );
});

// Update Appointment Status
app.put("/api/appointments/:id", (req, res) => {
  const { status } = req.body;
  const sql = "UPDATE appointments SET status = ? WHERE id = ?";
  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Status Updated" });
  });
});

// --- SLOT ROUTES ---

// Add Slot
app.post("/api/slots", (req, res) => {
  const { doctorId, dateTime } = req.body;
  const sql = "INSERT INTO slots (doctor_id, date_time) VALUES (?, ?)";
  db.query(sql, [doctorId, dateTime], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Slot Added" });
  });
});

// Get Slots by Doctor
app.get("/api/slots/:doctorId", (req, res) => {
  const sql = "SELECT * FROM slots WHERE doctor_id = ?";
  db.query(sql, [req.params.doctorId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Delete Slot
app.delete("/api/slots/:id", (req, res) => {
  const sql = "DELETE FROM slots WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Slot Removed" });
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
