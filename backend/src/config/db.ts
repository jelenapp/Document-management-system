import mongoose from 'mongoose';
import { MONGO_URI } from "./config";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log("There is already an existing MongoDB connection!");
        return;
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('Mongo connection error:', err);
        process.exit(1);
    }
    
};

export const disconnectDB = async () => {
    if (!isConnected)
        return;
    await mongoose.disconnect();
    console.log("MongoDB connection closed successfully!");
}