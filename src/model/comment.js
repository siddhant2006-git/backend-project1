import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    Vidio: {
      type: Schema.Types.ObjectId,
      refs:"Vidio"
      
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "gif"],
      default: "image",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// it can used to share those comment which are required to the user .
commentSchema.plugin(mongooseAggregatePaginate);


export const Comment = mongoose.model("Comment", commentSchema);
