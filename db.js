const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "panel.mait.ac.in",
  user: "edumania",
  password: "LHGhZredscmjhXSj",
  database: "edumania",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MariaDB.");
    return;
  }
  console.log("Connected to MariaDB.");
});

module.exports = db;