import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Tweet } from "./tweets";

const likeSchema = new Schema({
  Vidio: {
    type: Schema.Types.ObjectId,
    refs: "Vidio",
  },
  comment: {
    type: Schema.Types.ObjectId,
    refs: "comment",
  },
  Tweet: {
    type: Schema.Types.ObjectId,
    refs: "tweet",
  },
  LikeBY: {
    type: Schema.Types.ObjectId,
    refs: "User",
  },
});

export const LIKE=mongoose.model("Like",likeSchema)