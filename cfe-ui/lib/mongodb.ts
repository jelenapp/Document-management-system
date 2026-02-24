import mongoose from "mongoose"

/**
 * @deprecated This function has been moved to the backend.
 * Safe to delete after verification.
 */

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error);
  }
};