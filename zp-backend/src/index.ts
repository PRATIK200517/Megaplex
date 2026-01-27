import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/server';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 8000; 

app.use(cors({
  origin: `${process.env.FRONTEND_URL}`, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser())
app.use("/api", routes);


app.listen(PORT, () => {
    console.log(`Hello from server! running on port ${PORT}`);
});
