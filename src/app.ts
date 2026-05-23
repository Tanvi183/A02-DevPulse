import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './router/auth.routes';

dotenv.config();

const app = express();

// Global Middleware 

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API Routes

app.use('/api/auth', authRoutes);


app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
