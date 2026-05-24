import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './router/auth.routes';
import issuesRoutes from './router/issues.routes';
import metricsRoutes from './router/metrics.routes';
import { errorHandler } from './middleware/errorHandler';

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


// Check

app.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});


// API Routes

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/metrics', metricsRoutes);


// 404 Handler

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});


// Error Handler

app.use(errorHandler);

export default app;