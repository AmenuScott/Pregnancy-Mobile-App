const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messagesController");

router.post("/send", messageController.sendMessage);
router.get("/thread/:senderId/:receiverId", messageController.getMessageThread);
router.get("/:userId", messageController.getUserMessages); // if you still use it
router.get("/thread/:user1/:user2", messageController.getConversation);


module.exports = router;
