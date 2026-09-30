import mongoose, { Schema } from "mongoose";

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

export const Comment = mongoose.model("Comment", commentSchema);
