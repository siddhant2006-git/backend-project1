import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
    
    
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  fullname: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  avatar: {
    type: String,
    required: true,
  },
  coverImage: {
    
  }
    
})



export const User = mongoose.model("User", userSchema)
