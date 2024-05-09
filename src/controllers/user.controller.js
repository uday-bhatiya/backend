import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/ApiErrors.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiErrors(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Get user's details from frontend
    // Validation - (fields not empty)
    // Check if user already exists ( username or email)
    // Check for image ( avatar required )
    // Upload images to cloudinary ( Avatar )
    // Create user object ( entry in DB )
    // Remove password and refresh token field from response 
    // Check for user creation 
    // Return response

    const { fullName, email, username, password } = req.body
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiErrors(400, "All fields are required")
    } 

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiErrors(409, "User with email or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    //    const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiErrors(400, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiErrors(500, "Something went wrong")
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully "))

})

const loginUser = asyncHandler( async (req, res) => {
// Get data from req body
// Username or email
// Find the user
// Access and refresh token
// Send coockie

const {username, email, password} = req.body

if (!username || !email) {
    throw new ApiErrors(400, "Username or email are required")
}

const user = User.findOne({
    $or: [ {username}, {email}]
})

if (!user) {
    throw new ApiErrors(404, "User does not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password)
if (!isPasswordValid) {
    throw new ApiErrors(401,"Invalid password")
}

const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

const options = {
    httpOnly: true,
    secure: true
};

return res.status(200)
.coockie("accessToekn", accessToken, options)
.coockie("refreshToken", refreshToken, options)
.json(
    new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
    }, "User logged in successfully")
)

})

export { registerUser, loginUser }
