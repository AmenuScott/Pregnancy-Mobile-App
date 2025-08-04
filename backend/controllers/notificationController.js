const db = require("../db");

// GET all notifications for a user
exports.getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create a new notification
exports.createNotification = async (req, res) => {
  const { user_id, title, message, type, scheduled_at, related_data } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO notifications (user_id, title, message, type, scheduled_at, related_data)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, title, message, type, scheduled_at, related_data]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT mark a notification as read
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      "UPDATE notifications SET is_read = true WHERE id = $1",
      [id]
    );
    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a notification
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM notifications WHERE id = $1", [id]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
