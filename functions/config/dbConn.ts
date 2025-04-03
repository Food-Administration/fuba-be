import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not defined in the environment variables.');
        }

        await mongoose.connect(databaseUrl, {
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
        });
        console.log('Database connected successfully!');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

export default connectDB;