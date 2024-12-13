const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://meeting-front-kappa.vercel.app",
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    console.log(`User ${socket.id} joining room: ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push(socket.id);
    socket.join(roomId);

    socket.to(roomId).emit("user-connected", socket.id);

    io.to(roomId).emit("update-participants", rooms[roomId]);
  });

  socket.on("signal", ({ signal, recipient }) => {
    console.log(`Forwarding signal from ${socket.id} to ${recipient}`);
    socket.to(recipient).emit("signal", { signal, sender: socket.id });
  });

  socket.on("send-message", ({ roomId, message }) => {
    console.log(`Message from ${socket.id} in room ${roomId}: ${message}`);
    io.to(roomId).emit("receive-message", { sender: socket.id, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((userId) => userId !== socket.id);

      io.to(roomId).emit("user-disconnected", socket.id);
      io.to(roomId).emit("update-participants", rooms[roomId]);
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
