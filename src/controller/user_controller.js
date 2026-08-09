import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/async_handler.js";
import { User } from "../model/usermodel.js";
import { uploadcloudnary } from "../utils/cloudnary.js";
import { Apirsponse } from "../utils/apiresponse.js";

const registerUser = asynchandler(async (req, res) => {
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

  // Get avatar file
  const avatarFile = req.files?.avatar?.[0];

  if (!avatarFile) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Avatar local path
  const avatarLocalPath = avatarFile.path;

  
  const avatarUpload = await uploadcloudnary(avatarLocalPath);

  if (!avatarUpload?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // Get cover image
  const coverImageFile = req.files?.coverImage?.[0];

  let coverImageUpload = null;

  // Cover image is optional
  if (coverImageFile) {
    const coverImageLocalPath = coverImageFile.path;

    coverImageUpload = await uploadcloudnary(coverImageLocalPath);

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
    .json(new Apirsponse(201, createdUser, "User registered successfully"));
});

export { registerUser };

  
//hello 
