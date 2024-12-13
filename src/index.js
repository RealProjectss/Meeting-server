const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://meeting-front-kappa.vercel.app", // Ensure this URL matches your front-end URL
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-global", () => {
    users[socket.id] = socket.id;

    // Notify other users that a new user has joined
    socket.broadcast.emit("user-connected", socket.id);

    // Handle signaling
    socket.on("signal", ({ signal, sender }) => {
      if (users[sender]) {
        socket.broadcast.to(sender).emit("signal", { signal, sender: socket.id });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      delete users[socket.id];
      socket.broadcast.emit("user-disconnected", socket.id);
      console.log("User disconnected:", socket.id);
    });
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
