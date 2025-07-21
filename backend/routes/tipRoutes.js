const express = require("express");
const router = express.Router();
const tipController = require("../controllers/tipController");

// Scrape and save tips
router.get("/", tipController.getTips);


module.exports = router;
