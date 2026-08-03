import mongoose, { mongo, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const vidioSchema = new Schema({
  vidieoFile: {
    type: String,
    required: true,
  },

  thumbnail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  discription: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  views: {
    type: Number,
    deafult:0
  },

  isPublished :{
  type: Boolean,
    deafult:true
    
},
  owner: {
    type: Schema.Types.ObjectId,
    ref:"User"
  }
});

vidioSchema.plugin(mongooseAggregatePaginate)


export const vidio = mongoose.model("Vidio");
