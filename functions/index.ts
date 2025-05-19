// const functions = require("firebase-functions");
import express from 'express';
const dotenv = require("dotenv");
// import passport from 'passport';
import { initializeApp } from "firebase/app";
const cors = require('cors');
// import fileUpload from 'express-fileupload';
import connectDB from './config/dbConn';
import authRoutes from './routes/auth.route';
import roleRoutes from './routes/role.route'; 
import permissionRoutes from './routes/permission.routes'; 
import userRoutes from './routes/user.route';
import vendorRoutes from './routes/vendor.route';
import vendorTypeRoutes from './routes/vendorType.route';
import contractRoutes from './routes/contract.route';
import reviewRoutes from './routes/review.route';
import requestFlowRoutes from './routes/requestFlow.route';
import budgetRoutes from './routes/budget.route';
import procurementRoutes from './routes/procurement.route';
import logisticsRoutes from './routes/logistics.route';
import vendorInventoryRoutes from './routes/vendorInventory.route';
import companyInventoryRoutes from './routes/companyInventory.route';
import transportInventoryRoutes from './routes/transportInventory.route';
import accommodationInventoryRoutes from './routes/accommodationInventory.route';
import CustomError from './utils/customError';
import session from 'express-session';
import os from 'os';

dotenv.config();
const tempDir = os.tmpdir();
console.log(`Temporary directory: ${tempDir}`);

// const firebaseConfig = {
//   apiKey: "AIzaSyBHM1VRun-gj48pqUH7z_6XO4PzYnF6Q_A",
//   authDomain: "ferncot-c294a.firebaseapp.com",
//   projectId: "ferncot-c294a",
//   storageBucket: "ferncot-c294a.firebasestorage.app",
//   messagingSenderId: "1088358180822",
//   appId: "1:1088358180822:web:febe21bce7374885416677"
// };

const firebaseConfig = {
  apiKey: "AIzaSyA8qkTr3k8cWuRILVeB3xun81k1DEB3tMs",
  authDomain: "geodrillmanagerserver.firebaseapp.com",
  projectId: "geodrillmanagerserver",
  storageBucket: "geodrillmanagerserver.firebasestorage.app",
  messagingSenderId: "930637568279",
  appId: "1:930637568279:web:94334bce8a25e875b4bf52",
  measurementId: "G-D28LNTK6ZN"
};


// Initialize Firebase
initializeApp(firebaseConfig);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://ferncots.com'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    url: req.url
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/permission', permissionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/vendorInventory', vendorInventoryRoutes);
app.use('/api/companyInventory', companyInventoryRoutes);
app.use('/api/transportInventory', transportInventoryRoutes);
app.use('/api/accommodationInventory', accommodationInventoryRoutes);
app.use('/api/vendorType', vendorTypeRoutes);
app.use('/api/contract', contractRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/requestFlow', requestFlowRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/logistics', logisticsRoutes);

app.get('/api/great', (req, res) => {
  res.send('hahaha');
});

// Default route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Error-handling middleware
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
      verified: err.isEmailVerified !== undefined ? err.isEmailVerified : true,
    });
  }
);

// Catch-all route for undefined endpoints
app.all("*", async (req, res) => {
  try {
    res.status(404).json({ message: "Route not found", status: 404 });
  } catch (error: any) {
    throw new CustomError(error.message, 500); 
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDB(); // Connect to the database
});

// Export the app for Firebase Functions
// exports.app = functions.https.onRequest(app);

// export default app;