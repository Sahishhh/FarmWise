import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Expert } from "../models/expert.model.js";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access token");
    }
}

const registerUser = asyncHandler(async(req,res) => {
    // res.status(200).json({
    //     message:"ok"
    // })    

    const {fullname,username,email,password,userType,mobileno,specialization,birthDate} = req.body;

    console.log(req.body);

    if(
        [username,email,password,userType,mobileno].some((field)=> field?.trim()==="")
    ) {
        throw new ApiError(400,"All fields are required")
    }
    
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existedUser) {
        throw new ApiError(409,"User with email or username already exists")
    }

    if(userType==='expert' && !specialization) {
        throw new ApiError(400,"Specialization is required for expert")
    }
    
    const user = await User.create({
        fullname,
        coverImage:"",
        email,
        password,
        userType,
        username:username.toLowerCase(),
        mobileno,
        specialization,
        birthDate
    })
    const {accessToken,refreshToken} =  await generateAccessAndRefreshTokens(user._id);

    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500,"Something went wrong while registering user")
    }
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(201)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

const loginUser = asyncHandler(async(req,res) => {
    const {email,username,password} = req.body

    if(!username && !email) {
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user) {
        throw new ApiError(404,"User does not exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401,"Invalid user credential");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

    let loggedInUser = await User.findById(user._id).select("-password -refreshToken").lean();

    // If user is an expert, add verification status from Expert model
    if (loggedInUser.userType === 'expert') {
        const expert = await Expert.findOne({ userId: loggedInUser._id });
        if (expert) {
            loggedInUser = {
                ...loggedInUser,
                verified: expert.verified
            };
        }
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    console.log("Sending user data:", loggedInUser); // Debug log

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged out Successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user) {
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken ){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true,
        }
    
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "Access token successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req,res) =>{
    const {oldPassword,newPassword} = req.body
    console.log(req);
    console.log(oldPassword,newPassword);
    
    const user = await User.findById(req.user?._id)
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect) {
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullname,username,email} = req.body
    if(!fullname || !email || !username) {
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                username:username,
                email:email,
                fullname:fullname
            }
        },
        {new:true}
    ).select("-password")
    console.log(user)
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))

})

const updateUserProfileImage = asyncHandler(async(res,req) => {
    const profileImageLocalPath = req.file?.path
    if(!profileImageLocalPath) {
        throw new ApiError(400,"Cover Image file is missing")
    }

    const  profileImage = await uploadOnCloudinary(profileImageLocalPath)
    if(!profileImage.url) {
        throw new ApiError(400,"Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                profileImage:profileImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover Image updated successfully")
    )

})


export const getAllFarmers = asyncHandler(async(req,res) => {
    try {
        const farmers = await User.find({userType:"farmer"}).select("-password -refreshToken")
        if(!farmers) {
            return res.status(404).json({message:"No farmers found"})
        }

        return res.status(200).json(
            new ApiResponse(200,farmers,"Farmers fetched successfully")
        )
    } catch (error) {
        return res
        .status(5000)
        .json(
           {message:"Something went wrong while fetching farmers"}
        )
    }
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserProfileImage,
}