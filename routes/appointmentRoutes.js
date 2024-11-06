const express = require('express');
const router = express.Router();
const { bookAppointment } = require('../controllers/appointmentController');
const { updateAppointmentStatus } = require('../controllers/appointmentController');

// Route for booking an appointment
router.post('/book', bookAppointment);
router.put('/update-status', updateAppointmentStatus);

module.exports = router;
