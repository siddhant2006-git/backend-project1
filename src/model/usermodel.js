import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    fullname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "vidio",
      },
    ],
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generate_aceesstoken = function () {
  return jwt.sign(
    {
      _id: this._id,
      Email: this.Email,
      username: this.username,
    },
    process.env.Access_token_Secret,
    {
      expiresIn: process.env.Access_token_expire,
    }
  );
};
userSchema.methods.generate_refreshtoken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.Refresh_token_secret,
    {
      expiresIn: process.env.Refresh_token_expire,
    }
  );
};

export const User = mongoose.model("User", userSchema);
