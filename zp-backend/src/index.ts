import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/server';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 8000; 

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000' ,
    credentials:true
}))

app.use(express.json());
app.use(cookieParser())
app.use("/api", routes);


app.listen(PORT, () => {
    console.log(`Hello from server! running on port ${PORT}`);
});