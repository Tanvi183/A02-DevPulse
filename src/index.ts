import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());



// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to DevPulse API',
    status: 'running',
  });
});


app.get('/users', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(port, () => {
  console.log(`DevPulse server is running on http://localhost:${port}`);
});