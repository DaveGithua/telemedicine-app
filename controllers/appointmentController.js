const db = require('../config/db');


// Create an appointment
const bookAppointment = async (req, res) => {
  const { doctor_id, appointment_date, appointment_time } = req.body;
  const patient_id = req.session.patientId;

  // Check if the selected doctor is available at the selected date/time
  const checkAvailabilitySql = `
    SELECT * FROM Appointments
    WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
  `;
  try {
    const [existingAppointments] = await db.execute(checkAvailabilitySql, [doctor_id, appointment_date, appointment_time]);

    if (existingAppointments.length > 0) {
      return res.status(400).send('The selected time slot is already taken.');
    }

    // Insert the new appointment
    const sql = `
      INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
      VALUES (?, ?, ?, ?, 'scheduled')
    `;
    await db.execute(sql, [patient_id, doctor_id, appointment_date, appointment_time]);

    res.status(201).send('Appointment booked successfully!');
  } catch (error) {
    res.status(500).send('Error booking appointment: ' + error.message);
  }
};

// Reschedule or cancel an appointment
const updateAppointmentStatus = async (req, res) => {
    const { appointment_id, status, new_appointment_date, new_appointment_time } = req.body;
    const patient_id = req.session.patientId;
  
    // Validate status change
    if (!['scheduled', 'completed', 'canceled'].includes(status)) {
      return res.status(400).send('Invalid status.');
    }
  
    let sql;
    if (status === 'canceled') {
      // Cancel appointment
      sql = `UPDATE Appointments SET status = 'canceled' WHERE id = ? AND patient_id = ?`;
      await db.execute(sql, [appointment_id, patient_id]);
      return res.status(200).send('Appointment canceled.');
    }
  
    if (status === 'scheduled' && new_appointment_date && new_appointment_time) {
      // Reschedule appointment
      // Check if the new slot is available
      const checkAvailabilitySql = `
        SELECT * FROM Appointments
        WHERE doctor_id = (SELECT doctor_id FROM Appointments WHERE id = ?) 
        AND appointment_date = ? AND appointment_time = ?
      `;
      const [existingAppointments] = await db.execute(checkAvailabilitySql, [appointment_id, new_appointment_date, new_appointment_time]);
  
      if (existingAppointments.length > 0) {
        return res.status(400).send('The new time slot is already taken.');
      }
  
      sql = `UPDATE Appointments SET appointment_date = ?, appointment_time = ? WHERE id = ? AND patient_id = ?`;
      await db.execute(sql, [new_appointment_date, new_appointment_time, appointment_id, patient_id]);
  
      return res.status(200).send('Appointment rescheduled.');
    }
  
    // Mark appointment as completed (can be done by doctor/admin)
    if (status === 'completed') {
      sql = `UPDATE Appointments SET status = 'completed' WHERE id = ?`;
      await db.execute(sql, [appointment_id]);
      return res.status(200).send('Appointment marked as completed.');
    }
  };
  
  module.exports = { bookAppointment, updateAppointmentStatus };
  
