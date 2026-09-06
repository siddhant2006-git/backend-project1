import { asyncHandler  } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import {User} from "../model/usermodel.js"


// working of next- to next for working the page 
export const verifyJwt = asyncHandler (async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    
    if (!token) {
      throw new  ApiError(401,"unauthorised request ")
    }
  
    // decode - to translate and interprate something to understand themselves
    const decodeToken = jwt.verify(token, process.env.Access_token_Secret);
    
    const user = await User.findById(decodeToken?._id).select("-password -refreshToken");
    
    if (!user) {
      // next vidio :discuss about frontend 
      throw new ApiError(401,"invalid access token ")
    }
  
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401,"error?.message ||invalaid accesstoken" )
    
  }


})