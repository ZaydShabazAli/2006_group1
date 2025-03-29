import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost", // Default to localhost
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "policeapp_users",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

export default db;
