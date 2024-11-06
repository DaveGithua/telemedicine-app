const bcrypt = require('bcryptjs');
const db = require('../config/db');

const registerPatient = async (req, res) => {
  const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

  // Hash the password
  const password_hash = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO Patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    await db.execute(sql, [first_name, last_name, email, password_hash, phone, date_of_birth, gender, address]);
    res.status(201).send("Patient registered successfully!");
  } catch (error) {
    res.status(500).send("Error registering patient: " + error.message);
  }
};

const loginPatient = async (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM Patients WHERE email = ?`;
  try {
    const [rows] = await db.execute(sql, [email]);
    if (rows.length > 0) {
      const patient = rows[0];
      const match = await bcrypt.compare(password, patient.password_hash);
      if (match) {
        req.session.patientId = patient.id;
        res.send("Login successful");
      } else {
        res.status(401).send("Invalid credentials");
      }
    } else {
      res.status(404).send("Patient not found");
    }
  } catch (error) {
    res.status(500).send("Error logging in: " + error.message);
  }
};

module.exports = { registerPatient, loginPatient };
