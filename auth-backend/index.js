import express from "express"
import dotenv from "dotenv"
import authRouter from "./routes/auth.route.js" 
import connectToMongoDB from "./db/connectToMongoDB.js";
import cors from "cors"; 

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json()); 

app.use(cors({
  credentials: true,
  origin: [`${process.env.BE_HOST}:3000`, `${process.env.BE_HOST}:3001`]
 })); 
app.use('/auth', authRouter); 

app.get('/', (req, res) => {
  res.send('Congratulations HHLD Folks!');
});

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server is listening at http://localhost:${PORT}`);
});

