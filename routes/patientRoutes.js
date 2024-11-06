const express = require('express');
const router = express.Router();
const { getPatients } = require('../controllers/patientController');
const { updatePatientProfile } = require('../controllers/patientController');
const { deletePatientAccount } = require('../controllers/patientController');

// Route for fetching patients list (admin only)
router.get('/', getPatients);
router.put('/profile', updatePatientProfile);
router.delete('/delete', deletePatientAccount);

module.exports = router;
