 
import express from "express"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"  
dotenv.config();
const PORT = process.env.PORT || 5000;


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
   cors: {
       allowedHeaders: ["*"],
       origin: "*"
   }
});


io.on("connection", (socket) => {
   console.log('Client connected');
   socket.on('chat msg', (msg) => {
       console.log('Received msg ' + msg);


       io.emit('chat msg', msg);
   });
})


app.use(express.json());    

app.get('/', (req, res) => {
   res.send("Welcome to HHLD Chat App!");
}); 
server.listen(PORT, (req, res) => {
   
   console.log(`Server is running at ${PORT}`);
})
