const express = require('express');
const router = express.Router();
const { getTips } = require('../controllers/tipController');

router.get('/tips', getTips);

module.exports = router;
