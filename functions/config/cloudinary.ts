import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Validates that all required Cloudinary environment variables are set.
 * Call this during application startup to fail fast if configuration is missing.
 */
export const validateCloudinaryConfig = (): void => {
  const requiredEnvVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.warn(
      `Warning: Missing Cloudinary environment variables: ${missingVars.join(", ")}`
    );
    console.warn("File uploads to Cloudinary will not work until these are configured.");
  }
};

export default cloudinary;
