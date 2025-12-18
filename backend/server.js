const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files statically

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Load environment variables from .env file
require("dotenv").config();

// ==========================================
// CONFIGURATION (LOADED FROM .ENV)
// ==========================================
// We now access the variables using process.env
const TEXT_LK_API_TOKEN = process.env.TEXT_LK_API_TOKEN;
const TEXT_LK_SENDER_ID = process.env.TEXT_LK_SENDER_ID || "TextLK"; // Default to TextLK if not set
const PORT = process.env.PORT || 5000;
// ==========================================

// --- SMS ROUTE (Text.lk) ---
app.post("/api/send-sms", async (req, res) => {
  const { to, message } = req.body;

  console.log("Received SMS Request:", { to, message });

  // 1. Validation: Ensure phone number exists
  if (!to) {
    console.error("Error: Missing 'to' phone number");
    return res
      .status(400)
      .json({ success: false, error: "Missing phone number" });
  }

  // 2. Format Phone Number: Remove '+' if present
  const formattedNumber = to.toString().replace("+", "");

  try {
    const response = await axios.post(
      "https://app.text.lk/api/v3/sms/send",
      {
        recipient: formattedNumber,
        sender_id: TEXT_LK_SENDER_ID,
        type: "plain",
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${TEXT_LK_API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("SMS Sent Successfully:", response.data);
    res.json({ success: true, data: response.data });
  } catch (err) {
    const errorDetails = err.response ? err.response.data : err.message;
    console.error("Text.lk API Error:", JSON.stringify(errorDetails, null, 2));

    res.status(500).json({
      success: false,
      error: errorDetails,
    });
  }
});

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "pubudu_health",
  dateStrings: true, // Treats dates as strings to prevent timezone shifting
});

db.connect((err) => {
  if (err) console.error("Database connection failed:", err);
  else {
    console.log("MySQL Connected...");
    // Create Reports Table if not exists
    const sql = `CREATE TABLE IF NOT EXISTS reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      file_path VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    db.query(sql, (err, result) => {
      if (err) console.error("Error creating reports table:", err);

    });
  }
});

// --- AUTH ROUTES ---

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      const user = result[0];
      delete user.password;
      res.json(user);
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// Register (Generic)
app.post("/api/register", (req, res) => {
  const { email, password, role, firstName, lastName, phone, specialty } =
    req.body;
  const sql =
    "INSERT INTO users (email, password, role, first_name, last_name, phone, specialty) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [email, password, role, firstName, lastName, phone, specialty],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, ...req.body });
    }
  );
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

// Get Appointments (Updated to fetch Patient Phone)
app.get("/api/appointments", (req, res) => {
  const { userId, role } = req.query;
  // JOIN with users table to get the patient's phone number
  let sql = `
    SELECT appointments.*, users.phone AS patient_phone 
    FROM appointments 
    JOIN users ON appointments.patient_id = users.id
  `;
  let params = [];

  if (role === "doctor") {
    sql += " WHERE appointments.doctor_id = ?";
    params.push(userId);
  } else if (role === "patient") {
    sql += " WHERE appointments.patient_id = ?";
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

// --- REPORT ROUTES ---

// Get All Reports
app.get("/api/reports", (req, res) => {
  const sql = "SELECT * FROM reports ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Upload Report
app.post("/api/reports", upload.single("file"), (req, res) => {
  const { title, description } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : "";

  if (!filePath) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const sql =
    "INSERT INTO reports (title, description, file_path) VALUES (?, ?, ?)";
  db.query(sql, [title, description, filePath], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({
      id: result.insertId,
      title,
      description,
      file_path: filePath,
      created_at: new Date(),
    });
  });
});

// Delete Report
app.delete("/api/reports/:id", (req, res) => {
  const sql = "DELETE FROM reports WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Report deleted" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
