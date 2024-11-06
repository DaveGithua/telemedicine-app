const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Fetch all patients (admin only)
const getPatients = async (req, res) => {
    const { search } = req.query; // Optional search filter
  
    let sql = 'SELECT id, first_name, last_name, email, phone, date_of_birth, gender FROM Patients';
    let params = [];
  
    if (search) {
      sql += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
  
    try {
      const [patients] = await db.execute(sql, params);
      res.status(200).json(patients);
    } catch (error) {
      res.status(500).send('Error fetching patients: ' + error.message);
    }
  };
  
  // Update patient's profile information (excluding email and password)
const updatePatientProfile = async (req, res) => {
    const { first_name, last_name, phone, date_of_birth, gender, address } = req.body;
    const patient_id = req.session.patientId; // Assume the patient is logged in
  
    // SQL query for updating patient details
    const sql = `
      UPDATE Patients
      SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(sql, [first_name, last_name, phone, date_of_birth, gender, address, patient_id]);
  
      if (result.affectedRows > 0) {
        res.status(200).send('Patient profile updated successfully.');
      } else {
        res.status(404).send('Patient not found.');
      }
    } catch (error) {
      res.status(500).send('Error updating patient profile: ' + error.message);
    }
  };

  // Delete patient account
const deletePatientAccount = async (req, res) => {
    const patient_id = req.session.patientId;
  
    // First, delete appointments related to the patient
    const deleteAppointmentsSql = `DELETE FROM Appointments WHERE patient_id = ?`;
    
    try {
      // Start a transaction to ensure consistency
      await db.execute('START TRANSACTION');
  
      // Delete the patient's appointments
      await db.execute(deleteAppointmentsSql, [patient_id]);
  
      // Now delete the patient
      const deletePatientSql = `DELETE FROM Patients WHERE id = ?`;
      await db.execute(deletePatientSql, [patient_id]);
  
      // Commit the transaction
      await db.execute('COMMIT');
  
      // End the patient's session and clear their data
      req.session.destroy(() => {
        res.status(200).send('Patient account deleted successfully.');
      });
    } catch (error) {
      await db.execute('ROLLBACK'); // Rollback the transaction in case of error
      res.status(500).send('Error deleting patient account: ' + error.message);
    }
  };
  
  module.exports = { getPatients, updatePatientProfile, deletePatientAccount };
  
