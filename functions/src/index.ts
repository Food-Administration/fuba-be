import * as functions from 'firebase-functions';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import os from 'os';

import connectDB from '../config/dbConn';
import authRoutes from '../features/auth/auth.routes';
import CustomError from '../utils/customError';

// Load env variables
dotenv.config();

// Log temp directory
const tempDir = os.tmpdir();
console.log(`Temporary directory: ${tempDir}`);

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://ferncots.com',
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes); 


// Logger
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Error handler
app.use((err: CustomError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    verified: err.isEmailVerified !== undefined ? err.isEmailVerified : true,
  });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', status: 404 });
});

// Export Firebase Function
export const api = functions.https.onRequest(app);
