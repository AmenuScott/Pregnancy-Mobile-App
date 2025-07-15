const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./db"); // pg Pool configured with Supabase DATABASE_URL

// Routes
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const setupRoutes = require("./routes/setupRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const tipRoutes = require("./routes/tipRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const messageRoutes = require("./routes/messagesRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend to connect (React Native)
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tips", tipRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/messages", messageRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("🚀 PregCare API is up and running!");
});

// ✅ Database test route
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ dbTime: result.rows[0].now });
  } catch (err) {
    console.error("❌ DB test error:", err.message);
    res.status(500).json({ error: "Database not connected", details: err.message });
  }
});

// ⚡ SOCKET.IO Real-time chat
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId.toString());
    console.log(`👥 User ${userId} joined their room`);
  });

  socket.on("send_message", async (data) => {
    const { sender_id, receiver_id, content } = data;

    try {
      const result = await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",
        [sender_id, receiver_id, content]
      );

      const savedMessage = result.rows[0];
      io.to(receiver_id.toString()).emit("receive_message", savedMessage);
      console.log(`📩 Sent message from ${sender_id} to ${receiver_id}`);
    } catch (err) {
      console.error("❌ Message save error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
