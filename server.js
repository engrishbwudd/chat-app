// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Port configuration
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Object to store connected users
const users = {};

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for 'set username' event to assign username to the socket
  socket.on('set username', (username) => {
    users[socket.id] = username;
    console.log(`User set username: ${username}`);
    
    // Notify others that a new user has joined
    socket.broadcast.emit('user joined', `${username} has joined the chat`);
  });

  // Listen for chat messages from clients
  socket.on('chat message', (msg) => {
    const timestamp = new Date(); // Current date and time
    const username = users[socket.id] || 'Anonymous';

    // Create a message object
    const messageData = {
      username: username,
      message: msg,
      timestamp: timestamp
    };

    // Broadcast the message to all connected clients
    io.emit('chat message', messageData);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      // Notify others that the user has left
      socket.broadcast.emit('user left', `${username} has left the chat`);
      delete users[socket.id];
      console.log(`User disconnected: ${username}`);
    } else {
      console.log('A user disconnected');
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
