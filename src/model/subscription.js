import mongoose, { Schema } from "mongoose";

const subscriptionSchems = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId, //one who is suscribe
    ref:"User"
  },
  channel: {
    type: Schema.Types.ObjectId, // one to whom subscribe the is subscribing 
    ref: "User"
    

  }
}, { timestamps: true });

export const subscription=mongoose.model("subscription", subscriptionSchems)