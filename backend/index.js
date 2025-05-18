const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // React dev server URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active users
const activeUsers = new Map();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining
  socket.on("user-joined", (userData) => {
    activeUsers.set(socket.id, userData);
    socket.broadcast.emit("user-joined", {
      userId: socket.id,
      ...userData,
    });

    // Send current active users to the new user
    socket.emit(
      "active-users",
      Array.from(activeUsers.entries()).map(([id, data]) => ({
        userId: id,
        ...data,
      }))
    );
  });

  // Handle new messages
  socket.on("send-message", (messageData) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const message = {
        id: Date.now(),
        text: messageData.text,
        user: user,
        userId: socket.id,
        timestamp: new Date().toISOString(),
      };

      // Broadcast message to all clients
      io.emit("receive-message", message);
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    socket.broadcast.emit("user-typing", {
      userId: socket.id,
      username: activeUsers.get(socket.id)?.username,
      isTyping: data.isTyping,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    activeUsers.delete(socket.id);
    socket.broadcast.emit("user-left", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
