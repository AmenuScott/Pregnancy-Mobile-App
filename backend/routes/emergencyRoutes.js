const express = require('express');
const router = express.Router();
const controller = require('../controllers/emergencyController');

// ✅ POST: Add new contact
router.post('/:userId', controller.addContact);

// ✅ GET: Get all contacts for user
router.get('/:userId', controller.getContacts);

// ✅ DELETE: Remove contact by ID
router.delete('/:userId/:contactId', controller.deleteContact);

// ✅ PUT (Optional): Update contact
router.put('/:userId/:contactId', controller.updateContact);

module.exports = router;
