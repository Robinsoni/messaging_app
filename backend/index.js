import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { addMsgToConversation } from "./controllers/msgs.controller.js";
import msgsRouter from "./routes/msgs.route.js";
import connectToMongoDB from "./db/connectTOMongoDB.js"; 
import cors from 'cors';
const app = express();
app.use(cors());
dotenv.config();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    allowedHeaders: ["*"],
    origin: "*"
  }
});

const userSocketMap = {};
io.on('connection', (socket) => {
  const username = socket.handshake.query.username;
  console.log('Username of connected client:', username);
  userSocketMap[username] = socket; 
  socket.on('chat msg', (msg) => {
    const receiverSocket = userSocketMap[msg.receiver];
    socket.emit('chat msg', msg.text);
    console.log(" socket server received msg from ", msg.sender, " for receiver ** ", msg.receiver ); 
    if (receiverSocket) {
      receiverSocket.emit('chat msg', msg);
    } 
    addMsgToConversation([msg.sender, msg.receiver], {
      text: msg.text,
      sender: msg.sender,
      receiver: msg.receiver
    });
  });
}); 

app.use('/msgs',msgsRouter);
// Define a route
app.get('/', (req, res) => {
  res.send('Congratulations HHLD Folks!');
});

// Start the server
server.listen(PORT, (req, res) => {
  connectToMongoDB();
  console.log(`Server is running at ${PORT}`);
})
