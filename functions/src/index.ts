const functions = require("firebase-functions");
import express from 'express';
const dotenv = require("dotenv");
const cors = require('cors');
import connectDB from '../config/dbConn';
import authRoutes from '../features/auth/auth.routes';
import CustomError from '../utils/customError';
import os from 'os';
dotenv.config();
const tempDir = os.tmpdir();
console.log(`Temporary directory: ${tempDir}`);

const app = express();
const port = process.env.SERVERPORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://ferncots.com'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);



// Default route
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use(
  (
    err: CustomError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      // If isEmailVerified is defined, return its value; otherwise, assume true.
      verified: err.isEmailVerified !== undefined ? err.isEmailVerified : true,
    });
  }
);

app.all("*", async (req, res) => {
  try {
    res.status(404).json({ message: "Route not found", status: 404 });
  } catch (error: any) {
    throw new CustomError(error.message, 500); 
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDB(); // Connect to the database
});

exports.app = functions.https.onRequest(app);