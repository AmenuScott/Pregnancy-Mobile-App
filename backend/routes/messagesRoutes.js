const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");

// Save message
router.post("/send", messagesController.sendMessage);

// Get message thread (old method)
router.get("/thread/:senderId/:receiverId", messagesController.getMessageThread);

// Get conversation (Supabase)
router.get("/conversation/:user1/:user2", messagesController.getConversation);

// Optional: get all messages for a user
router.get("/:userId", messagesController.getUserMessages);

module.exports = router;
