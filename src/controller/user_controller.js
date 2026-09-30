import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/usermodel.js";
import { Tweet } from "../model/tweets.js";
import { Comment } from "../model/comment.js";
import { deleteFromCloudinary, uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accesstoken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const body = Object.fromEntries(
    Object.entries(req.body).map(([key, value]) => [
      key.trim(),
      typeof value === "string" ? value.trim() : value,
    ])
  );

  const { fullname, username, email, password } = body;
  const avatarFile = req.files?.avatar?.[0];

  if ([fullname, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  if (!avatarFile?.path) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarUpload = await uploadCloudinary(avatarFile.path);

  if (!avatarUpload?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const coverImageFile = req.files?.coverImage?.[0];
  let coverImageUpload = null;

  if (coverImageFile) {
    coverImageUpload = await uploadCloudinary(coverImageFile.path);
    if (!coverImageUpload?.url) {
      throw new ApiError(400, "Cover image upload failed");
    }
  }

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatarUpload.url,
    coverImage: coverImageUpload?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ((!username && !email) || !password) {
    throw new ApiError(400, "Username or email and password are required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accesstoken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accesstoken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAceessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired");
  }

  const { accesstoken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accesstoken, refreshToken },
        "Access token refreshed successfully"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getcurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "Fullname and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalImage = req.file?.path || req.files?.avatar?.[0]?.path;

  if (!avatarLocalImage) {
    throw new ApiError(400, "New avatar file is missing");
  }

  const user = await User.findById(req.user?._id).select("avatar");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.avatar) {
    await deleteFromCloudinary(user.avatar);
  }

  const avatarUpload = await uploadCloudinary(avatarLocalImage);

  if (!avatarUpload?.url) {
    throw new ApiError(400, "Error uploading the avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarUpload.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

const updateUserCoverAvatar = asyncHandler(async (req, res) => {
  const coverLocalImage =
    req.file?.path ||
    req.files?.avatar?.[0]?.path ||
    req.files?.coverImage?.[0]?.path;

  if (!coverLocalImage) {
    throw new ApiError(400, "Cover avatar file is missing");
  }

  const user = await User.findById(req.user?._id).select("coverImage");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.coverImage) {
    await deleteFromCloudinary(user.coverImage);
  }

  const coverImage = await uploadCloudinary(coverLocalImage);

  if (!coverImage?.url) {
    throw new ApiError(400, "Error uploading the cover image");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover image updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribersTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribeToCount: {
          $size: "$subscribersTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        password: 0,
        username: 1,
        fullname: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribeToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        watchHistory: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0]?.watchHistory || [],
        "Watch history fetched successfully"
      )
    );
});

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find({ owner: req.user._id })
    .populate("owner", "username fullname avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const createComment = asyncHandler(async (req, res) => {
  const { content, tweetId } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  const createdComment = await Comment.create({
    content,
    owner: req.user._id,
    tweet: tweetId,
  });

  const populatedComment = await Comment.findById(createdComment._id).populate(
    "owner",
    "username fullname avatar"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedComment, "Comment created successfully")
    );
});

const getComment = asyncHandler(async (req, res) => {
  const { tweetId } = req.query;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  const comments = await Comment.find({ tweet: tweetId })
    .populate("owner", "username fullname avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const currentUserId = req.user?._id?.toString();
  const commentOwnerId = comment.owner?.toString();

  if (currentUserId !== commentOwnerId) {
    throw new ApiError(403, "You can only delete comments created by you");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
  registerUser,
  loginUser,
  logout,
  refreshAceessToken,
  changeCurrentPassword,
  getcurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverAvatar,
  getUserChannelProfile,
  getWatchHistory,
  createTweet,
  getUserTweets,
  createComment,
  getComment,
  deleteComment,
};
