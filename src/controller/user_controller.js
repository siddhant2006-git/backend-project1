import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/usermodel.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  console.log("email:", email);
  console.log("fullname:", fullname);

  // Check required fields
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("existedUser:", existedUser);

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

const avatarFile = req.files?.avatar?.[0];

if (!avatarFile) {
  throw new ApiError(400, "Avatar file is required");
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
  
  const { email, username, password } = req.body
  
  if (!username || !email) {
    throw new ApiError(400,"username or password is required ")
  }

  const user=await User.findOne({
    $or:[{username},{email}]
    
  })

  if (!user) {
    throw new ApiError(404,"Users does not exist ")
  }
  
   
})


export { registerUser,loginUser };
