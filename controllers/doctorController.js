const db = require('../config/db');

// Update doctor's schedule
const updateDoctorSchedule = async (req, res) => {
  const { doctor_id, schedule } = req.body; // Expecting schedule as a JSON object

  // Validate that schedule is a valid object
  if (typeof schedule !== 'object') {
    return res.status(400).send('Invalid schedule format.');
  }

  const sql = `UPDATE Doctors SET schedule = ? WHERE id = ?`;
  try {
    await db.execute(sql, [JSON.stringify(schedule), doctor_id]);
    res.status(200).send('Doctor schedule updated successfully!');
  } catch (error) {
    res.status(500).send('Error updating doctor schedule: ' + error.message);
  }
};

module.exports = { updateDoctorSchedule };
