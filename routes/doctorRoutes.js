const express = require('express');
const router = express.Router();
const { updateDoctorSchedule } = require('../controllers/doctorController');

// Route for updating doctor's schedule
router.put('/:doctor_id/schedule', updateDoctorSchedule);

module.exports = router;
