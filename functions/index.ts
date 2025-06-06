// const functions = require("firebase-functions");
import express from 'express';
const dotenv = require("dotenv");
const cors = require('cors');
import connectDB from './config/dbConn';
import authRoutes from './features/auth/auth.route';
import userRoutes from './features/user/user.route';
import propertyRoutes from './features/property/property.route';
import blogRoutes from './features/blog/blog.route';
import CustomError from './utils/customError';
import session from 'express-session';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
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

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/blog', blogRoutes);

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
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDB();
});