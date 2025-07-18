const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');

router.post('/', setupController.savePregnancyProfile);

module.exports = router;
