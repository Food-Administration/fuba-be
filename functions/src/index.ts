import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
// import authRoutes from "./routes/auth.routes";

dotenv.config();
admin.initializeApp();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
// app.use("/api/auth", authRoutes);

// Connect to MongoDB
const MONGO_URI = process.env.DATABASE_URL || "your-mongodb-uri-here";
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Export Firebase function
export const api = functions.https.onRequest(app);
