const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Routes
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const setupRoutes = require("./routes/setupRoutes");
const tipRoutes = require("./routes/tipRoutes");
const exercisesRoutes = require("./routes/exercisesRoutes")
const emergencyRoutes = require("./routes/emergencyRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const healthRoutes = require("./routes/healthRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const recoveryTipsRoutes = require("./routes/recoveryTipsRoutes")
const menstrualRoutes = require("./routes/menstrualRoutes");
const babyTipsRoutes = require("./routes/babyTipsRoutes")
const personalizedRoutes = require("./routes/personalizedRoutes");
const babyProfileRoutes = require("./routes/babyProfileRoutes");
const dietRoutes = require("./routes/dietRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend connection (e.g. Expo app)
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/", patientRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/", tipRoutes);
app.use(exercisesRoutes)
app.use('/api/emergency_contacts', emergencyRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/", recoveryRoutes);
app.use("/api/recovery-tips", recoveryTipsRoutes);
app.use("/api/", menstrualRoutes);
app.use("/api", babyTipsRoutes);
app.use(personalizedRoutes);
app.use("/api", babyProfileRoutes);
app.use(dietRoutes);
app.use(notificationRoutes);


// Base route
app.get("/", (req, res) => {
  res.send("🚀 PregCare API is up and running!");
});

// Optional: test Supabase DB connection
app.get("/health", async (req, res) => {
  const { data, error } = await supabase.rpc("now");
  if (error) {
    console.error("❌ Supabase error:", error.message);
    return res.status(500).json({ error: "Supabase not connected", details: error.message });
  }
  res.json({ dbTime: data });
});

// ✅ SOCKET.IO Real-time logic
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join room based on user ID
  socket.on("join", (userId) => {
    socket.join(userId.toString());
    console.log(`👥 User ${userId} joined room`);
  });

  // Handle sending a message
  socket.on("send_message", async (data) => {
    const { sender_id, receiver_id, content } = data;

    try {
      const { data: savedMessage, error } = await supabase
        .from("messages")
        .insert([{ sender_id, receiver_id, content }])
        .select()
        .single();

      if (error) throw error;

      // Send to receiver
      io.to(receiver_id.toString()).emit("receive_message", savedMessage);
      console.log(`📨 Message sent from ${sender_id} to ${receiver_id}`);
    } catch (err) {
      console.error("❌ Supabase message error:", err.message);
    }

      socket.on("delete_message", async (messageId) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      io.emit("message_deleted", messageId); // notify all clients
      console.log("🗑️ Deleted message:", messageId);
    } catch (err) {
      console.error("❌ Failed to delete message:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});
  });

  // Typing indicators
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId.toString()).emit("typing", { senderId, receiverId });
    console.log(`✍️ User ${senderId} is typing to ${receiverId}`);
  });

  socket.on("stop_typing", ({ senderId, receiverId }) => {
    io.to(receiverId.toString()).emit("stop_typing", { senderId, receiverId });
    console.log(`🛑 User ${senderId} stopped typing to ${receiverId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });





// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
