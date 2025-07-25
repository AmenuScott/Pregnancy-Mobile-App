const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");

router.post("/send", messagesController.sendMessage);
router.get("/thread/:senderId/:receiverId", messagesController.getMessageThread);
router.get("/conversation/:user1/:user2", messagesController.getConversation);

// ✅ NEW route to fetch chat inbox (users the current user has messaged with)
router.get("/inbox/:userId", messagesController.getChatPartners);

router.get("/inbox/:userId", messagesController.getInbox);

module.exports = router;
