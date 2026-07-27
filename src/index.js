import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({
  path: './.env'
});


connectDB()


// import express from "express";

/*
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
  */
 