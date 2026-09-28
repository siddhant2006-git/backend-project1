import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/usermodel.js";
import { deleteFromCloudinary, uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ACCESSTOKEN - acesstoken is main used for short time of period
// refreshToken - refreshtoken is main used to the long time of the period

const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accesstoken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // refreshToken value = value can be return eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N...abc123...
    user.refreshToken = refreshToken;
    console.log(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something is wrong access and refresh token ");
  }
};

// object.fromentity - it is main use to the key value pair convert into the object

const registerUser = asyncHandler(async (req, res) => {
  const body = Object.fromEntries(
    Object.entries(req.body).map(([key, value]) => [
      key.trim(),
      typeof value === "string" ? value.trim() : value,
    ])
  );

  const { fullname, username, email, password } = body;
  // Check required fields
  // some - means at least one required things can satisfy the condiition
  if ([fullname, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }
  const avatarUpload = await uploadCloudinary(avatarFile.path);

  if (!avatarUpload?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Get cover image
  const coverImageFile = req.files?.coverImage?.[0];

  let coverImageUpload = null;

  // Cover image is optional
  if (coverImageFile) {
    const coverImageLocalPath = coverImageFile.path;

    coverImageUpload = await uploadCloudinary(coverImageLocalPath);
    console.log(coverImageUpload);

    if (!coverImageUpload?.url) {
      throw new ApiError(400, "Cover image upload failed");
    }
  }

  // Create user
  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatarUpload.url,
    coverImage: coverImageUpload?.url || "",
  });

  // Remove password and refreshToken
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
  // email ,
  // phone number ,
  // username
  //password
  // find the user
  // access and refresh token
  // access token - it can work on the short time of period .
  // refresh token - it can work on the long time of period .
  // send cookie .- cookies are  a small piece of data a website can be store in the brower.

  const { email, username, password } = req.body;

  if ((!username && !email) || !password) {
    throw new ApiError(400, "username or email and password are required");
  }

  // findOne- to find the username and email .

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "Users does not exist ");
  }

  //ispasswordcorrect - it can used to check password is correct  or not.
  const ispasswordvalid = await user.isPasswordCorrect(password);

  if (!ispasswordvalid) {
    throw new ApiError(401, "password is incorrect");
  }

  const { accesstoken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
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
        "User logged in successfully "
      )
    );
});

//middleware -
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logedOut "));
});

const refreshAceessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request ");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, error?.message);
  }

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token ");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "refresh token  is expired ");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };
  const { accesstoken, refreshToken } =
    await generateAccessTokenandRefreshToken(user._id);

  return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshToken, options);
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "ispassword is incorrect ");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password is changed successfully  "));
});

const getcurrentUser = asyncHandler(async (req, res) => {});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "all fields are require if fullname & email");
  }
  // findbyIdUpdate - it can be used to the update the value .
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details update successfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalImage = req.file?.path || req.files?.avatar?.[0]?.path;

  if (!avatarLocalImage) {
    throw new ApiError(400, "new avatar file is missing");
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
    throw new ApiError(400, "error for uploading the avatar");
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
    .json(new ApiResponse(200, updatedUser, "avatar updated successfully"));
});

const updateUserCoverAvatar = asyncHandler(async (req, res) => {
  const avatarLocalImage =
    req.file?.path ||
    req.files?.avatar?.[0]?.path ||
    req.files?.coverImage?.[0]?.path;

  if (!avatarLocalImage) {
    throw new ApiError(400, "cover avatar file is missing");
  }

  const user = await User.findById(req.user?._id).select("coverImage");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.coverImage) {
    await deleteFromCloudinary(user.coverImage);
  }

  const coverImage = await uploadCloudinary(avatarLocalImage);

  if (!coverImage?.url) {
    throw new ApiError(400, "error for uploading the avatar");
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
    .json(new ApiResponse(200, updatedUser, "cover image can be updated"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // params - to get the value from the url .
  // ex - app.get("/users/:id", (req, res) => {
  // console.log(req.params);
  // });
  // o/p - /users/100 100 is value can be return  .

  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "username is missing ");
  }
  // aggregate - is used to process of document and produce the result them .

  // match -it can check the data can be same or not .
  //lookup - it is used to combine the data from one resouce to another .
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    // how can follower in my channel - it count the user
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    //how many channel can be subscribe by me - it can count the channel .
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribersTo",
      },
    },
    {
      // size - to count the subscribe
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribeToCount: {
          $size: "$subscribersTo",
        },
        // $cond - it can basic work like if-else check the condition .
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
        password: 1,
        username: 1,
        fullname: 1,
        email: 1,
        subscribers: 1,
        subscribersTo: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel doesnot access");
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
    // it can check out of the pipeline can do work
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
                  
                    $addFields: {
                      owner: {
                        $first:"$owner"
                      
                    }
                  }
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
};
