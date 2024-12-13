const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When a user joins a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Signaling for WebRTC
  socket.on("signal", ({ roomId, signal, sender }) => {
    socket.to(roomId).emit("signal", { signal, sender });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
