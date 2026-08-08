import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/async_handler.js";
import { User } from "../model/usermodel.js"
import { uploadcloudnary } from "../utils/cloudnary"
import { Apirsponse } from "../utils/apiresponse.js";

const registerUser = asynchandler(async (req, res) => {
  // create user
  //1 . name , surname ,email ,mobil no , password - upeercase ,lower case, special character singn i n .
  // 2. validation -not null.
  //3. if already exists : check username , email
  // 4. check for image and vidio
  // send to cloudnary
  // create user object - create un entry db
  // remove password and refresh token
  // check for creation for the user response
  // return to res

  const { fullname, username, email, password } = req.body;
  console.log("email", email);
  console.log("fullname",fullname )

  // throw - those method is used to generate the error form.

  // if (fullname == null) {
  //   throw new ApiError(400,"fullname is required ")
  // }

  // some keyword - it is used to check the one condition is satisfy in your array .

  if (
    [fullname, email, username].some((field) => 
      field?.trim() === "" 
    )

    
  ) {
    throw new ApiError(400,"All field are required ")

  
  }  
  // findone - it is used to check data can be have in data base or not .
  
  const existedUser = await User.findOne(
    {
      $or: [{ username }, { email }],
    },
    
  );
  console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409,"user with email, username can be exist")
    
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const avatarLocalPath = req.files?.avatar[0]?.path;
  req.files?.coverImage[0]?.path

  if (!avatar) {
    throw new ApiError(400 , "avatar file is required ")
  }

  const avatar = await uploadcloudnary(avatarLocalPath)
  const image = await uploadcloudnary(coverImage)
  
  if (!avatar) {
    throw new ApiError(400, "avatar file is required ")

  }
  const user=await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
    
  })

  const createuser = await User.findById(user._id).select(
    "-password -Refresh_token"
  );

  if (!createuser) {
    throw new ApiError(500,"something is wrong ")
  }
  return res.status(201).json(
    new Apirsponse(200,createuser,"user registered successfully")
  )
});



export { registerUser };
