import {asyncHandler} from "../utils/asyncHandler.js"

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

    // const {fullName, email, username, password } = req.body
    // console.log("email: ", email);
    console.log("workng user controller")
    res.status(200).json({
        message: "ok"
    })

})

export {registerUser}

