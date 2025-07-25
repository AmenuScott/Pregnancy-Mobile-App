const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");

// Send a message
router.post("/send", messagesController.sendMessage);

// Get message thread between two users
router.get("/thread/:senderId/:receiverId", messagesController.getMessageThread);

// Get full conversation between two users
router.get("/conversation/:user1/:user2", messagesController.getConversation);

// ✅ Get list of unique chat partners (for "New Chat" list)
router.get("/partners/:userId", messagesController.getChatPartners);

// ✅ Get inbox with last message and unread count (main Messages screen)
router.get("/inbox/:userId", messagesController.getInbox);

// ✅ Mark messages from sender as read
router.put("/mark-read/:senderId/:receiverId", messagesController.markMessagesAsRead);

module.exports = router;
