import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.log("mongoose connection error ", error);
    process.exit(1);
  }
};
export default connectDB;
