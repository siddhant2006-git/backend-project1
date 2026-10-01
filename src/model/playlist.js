import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const PlaylistSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Vidio: [{
    type: Schema.Types.ObjectId,
    refs: "Vidio",
  }],
  Name: {
    type: string,
    required:true 
      
  },
  Description: {
    type: string, 
    required:true
    
  }
});

export const playlist=mongoose.model("playlist",PlaylistSchema)