import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler( async (req, res, next) => {
  try {
      const token = req.coockies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
      if (!token) {
          throw new ApiErrors(401, "Unauthorized request")
      }
  
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
      const user = await User.findById(decodedToken?._id).select("-passwprd -refreshToken");
      
      if (!user) {
          throw new ApiErrors(401, "Invalid Access token")
      }
  
      req.user = user
      next()
  } catch (error) {
    throw new ApiErrors(401, error?.message || "Invalid access token")
  }

})