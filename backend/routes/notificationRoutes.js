const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/api/notifications/:userId", notificationController.getNotifications);
router.post("/api/notifications", notificationController.createNotification);
router.put("/api/notifications/:id/mark-as-read", notificationController.markAsRead);
router.delete("/api/notifications/:id", notificationController.deleteNotification);

module.exports = router;
