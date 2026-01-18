const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pubudu_health",
});

const seedAdmin = async () => {
  const email = "admin@admin.com";
  const password = "123"; // The new password you want
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Check if admin exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      // Update existing admin
      const sql = "UPDATE users SET password = ? WHERE email = ?";
      db.query(sql, [hashedPassword, email], (err, result) => {
        if (err) throw err;
        console.log(`Admin password updated to: ${password}`);
        process.exit();
      });
    } else {
      // Create new admin
      const sql =
        "INSERT INTO users (email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)";
      db.query(
        sql,
        [email, hashedPassword, "admin", "System", "Admin"],
        (err, result) => {
          if (err) throw err;
          console.log(`Admin created. Login with: ${email} / ${password}`);
          process.exit();
        }
      );
    }
  });
};

seedAdmin();
