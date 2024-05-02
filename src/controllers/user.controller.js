import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async (req, res) => {
    // Get user's details from frontend
    // Validation - (fields not empty)
    // Check if user already exists ( username or email)
    // Check for image ( avatar required )
    // Upload images to cloudinary ( Avatar )
    // Create user object ( entry in DB )
    // Remove password and refresh token field from response 
    // Check for user creation 
    // Return response

    const {fullName, email, username, password } = req.body
    // console.log("email: ", email);
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiErrors(400, "All fields are required")
    }
})

const existedUser = User.findOne( {
    $or: [ {username }, { email }]
})
if (existedUser) {
    throw new ApiErrors(409, "User already exist")
}

const avatarLocalPath = req.files?.avatar[0]?.path
const coverImgLocalPath = req.files?.coverImage[0]?.path

if (avatarLocalPath) {
    throw new ApiErrors(400, "Avatar file is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImgLocalPath)

if (!avatar) {
    throw new ApiErrors(400, "Avatar file is required")
}

const user = User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

})

const createdUser = await User.findById(user._id).select("password -refreshToken")

if (!createdUser) {
    throw new ApiErrors(500, "Something went wrong while registering the user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
)

export {registerUser}
