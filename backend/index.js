import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http"; 



const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000; 
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
      allowedHeaders: ["*"],
      origin: "*"
    }
});

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('chat msg', (msg) => {
      console.log('Received msg ' + msg);
    
      io.emit('chat msg', msg);
  });
});

// Define a route
app.get('/', (req, res) => {
  res.send('Congratulations HHLD Folks!');
});

// Start the server
server.listen(PORT, (req, res) => {
  console.log(`Server is running at ${PORT}`);
})
