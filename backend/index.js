import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { addMsgToConversation } from "./controllers/msgs.controller.js";
import msgsRouter from "./routes/msgs.route.js";
import connectToMongoDB from "./db/connectTOMongoDB.js";
import cors from 'cors';
import { subscribe, publish } from "./redis/msgsPubSub.js";
/* import Valkey from "ioredis"; */

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
  const channelName = `chat_${username}`;
  subscribe(channelName, (msg) => {
    console.log('Received message:', msg);
    socket.emit("chat msg", JSON.parse(msg));
  });

  socket.on('chat msg', (msg) => {

    const receiverSocket = userSocketMap[msg.receiver];
    if (receiverSocket) {
      receiverSocket.emit('chat msg', msg);
    } else {
      console.log(" checking the publish function of redis pub sub** ");
      const channelName = `chat_${msg.receiver}`;
      publish(channelName, JSON.stringify(msg));
    }

    addMsgToConversation([msg.sender, msg.receiver], {
      text: msg.text,
      sender: msg.sender,
      receiver: msg.receiver
    });
  });
});

app.use('/msgs', msgsRouter);
// Define a route
app.get('/', (req, res) => {
  res.send('Congratulations HHLD Folks!');
});

/** testing ioredis */ 
/* const serviceUri = `rediss://${process.env.REDIS_USER}:AVNS_${process.env.REDIS_PWD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
const valkey = new Valkey(serviceUri);

valkey.set("key", "hello world");

valkey.get("key").then(function (result) {
    console.log(`The value of key is: ${result}`);
    valkey.disconnect();
}); */
/** ** */

// Start the server
server.listen(PORT, (req, res) => {
  connectToMongoDB();
  console.log(`Server is running at ${PORT}`);
})
