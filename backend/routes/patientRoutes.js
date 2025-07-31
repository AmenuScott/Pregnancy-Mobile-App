const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authenticateToken = require('../middleware/authMiddleware');

// Signup
router.post('/signup', patientController.registeruser);

// Login
router.post('/login', patientController.loginUser);

// Complete pregnancy profile setup
router.post('/setup/:userId', patientController.completeSetup);

// Fetch pregnancy profile (for home screen)
router.get('/profile/:userId', patientController.getProfile);

// Fetch all patients (for NewChats screen)
router.get('/patients', patientController.getAllPatients);


module.exports = router;
