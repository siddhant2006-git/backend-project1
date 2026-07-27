


import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";




const connectDB = async () => {
  try {
    const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("DB_NAME:", DB_NAME);
  
    console.log(`MongoDB connected: ${connection.connection.host}`);
    
  } catch (error) {
    console.log("mongoose connection error ", error);
    process.exit(1)  
  
  }
}
 export default connectDB