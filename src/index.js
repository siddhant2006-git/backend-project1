import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to the database", error);
  });
    

  
import express from "express";


(async () => {
  try {

    await mongoose.connect(`${process.env.MONGO_URI}`)
    app.on("error", (error) => {
      console.log("Err", error);
      throw error;
    })
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    })
    
  } catch (error) {
    console.log("Errror", error)
    throw err
  }
  
})
  
