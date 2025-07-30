const express = require('express')
const router = express.Router()
const controller = require('../controllers/emergencyController')

// POST a contact
router.post('/:userId', controller.addContact)

// GET contacts
router.get('/:userId', controller.getContacts)

// DELETE contact
router.delete('/:userId/:contactId', controller.deleteContact)

module.exports = router
