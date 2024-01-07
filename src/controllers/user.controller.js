import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"; //Api Error helps to throw errors
import {User} from "../models/user.model.js"; //getting Data from user model file
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  Jwt  from "jsonwebtoken";


const generateAccessAndReferenshTokens= async(userId) => 
{
    try{
        const user= await  User.findById(userId)
     const accessToken =   user.generateAccessToken()
     const refreshToken =   user.generateRefreshToken()

     user.refreshToken=refreshToken
    await user.save({validateBeforeSave  : false})
    console.log("This is Acces while login",accessToken)

    return {accessToken , refreshToken}
    
    } catch(error){
        throw new ApiError(500, "Something went wrong while generating Referesh and Access Token")
    }


}


const registerUser = asyncHandler( async (req, res) => {

    const {username, email, password, }=req.body
    console.log(username)
    const lowercaseUsername = username.toLowerCase();
   
    console.log("email :", email,"passwod :" , password, );
    
    if(email.trim()===""){
        throw new ApiError(400, "Email is required")
    }
    else if(password.trim()===""){
        throw new ApiError(400, "Password is required")
    }
    
    //here checking if User already Exist with same data in data base than show error
    
    const existedUserByUsername = await User.findOne({ username: lowercaseUsername });

    if (existedUserByUsername) {
        throw new ApiError(409, "Username already exists");
    }
    
    
    const existedUserByEmail = await User.findOne({ email });
    
    if (existedUserByEmail) {
        throw new ApiError(409, "Email already exists");
    }

        const avatarLocalPath=req.files?.avatar[0]?.path;
        // const coverImageLocalPath=req.files?.coverImage[0]?.path;

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar File is required")
        }

        const avatar=await uploadOnCloudinary(avatarLocalPath)
        // const coverImage=await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400, "Avatar File is required")
        }

       const user=await User.create({
            // fullName,
            avatar:avatar.url,
            // coverImage:coverImage?.url|| "", //here if user dont want to upload coverImage then its Ok
            email,
            password,
            username:username.toLowerCase()
        })

        const userCreated=await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!userCreated){
            throw new ApiError(500, "Something went wrong when registering the User")
        }

        return res.redirect("/yourblog")

} )


const generateTokens = async (userId) => {
    const { accessToken, refreshToken } = await generateAccessAndReferenshTokens(userId);
    return { accessToken, refreshToken };
  };


const loginUser = asyncHandler(async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email) {
        throw new ApiError(400, "Email is required");
      }
  
      const user = await User.findOne({ $or: [{ email }, { password }] });
  
      if (!user) {
        throw new ApiError(400, "User does not exist");
      }
  
      const isPasswordValid = await user.isPasswordCorrect(password);
  
      if (!isPasswordValid) {
        throw new ApiError(401, "Password is invalid");
      }
  
      const { accessToken, refreshToken } = await generateTokens(user._id);
      const logedInUser = await User.findById(user._id).select("-password -refreshToken");
  
      console.log("Generated Access Token:", accessToken);
  
      const options = {
        httpOnly: false,
        secure: false,
        
      };
  
      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        // .json(
        //   new ApiResponse(200, {
            // user: logedInUser,
            // accessToken,
            // refreshToken,
        //   },
        //   "User Logged In Successfully"
        //   )
        // );
  
      // Log a message indicating that cookies are being set
      console.log("Cookies are being set!");
      res.redirect('/yourblog');
  
    } catch (error) {
      console.error("Error in loginUser:", error);
      res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
  });
  


const logoutUser = asyncHandler(async(req , res) => {
 User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        },
        
    },
    {
        new:true
    }
 )

 const options={

    httpOnly: true,
    secure:true
}
    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200, {}, "User Logged out"))
}) 


const refreshAccessToken = asyncHandler(async(req , res) => {

   const incomingRefreshToken= req.cookie.refreshToken||req.body.refreshToken
   if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized request")
   }

   try {
    const decodedToken=Jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
    )
 
    const user= await User.findById(decodedToken?._id)
    if(!user){
     throw new ApiError(401, "Invalid refresh Token")
    }
 
 
    if(incomingRefreshToken !==user?.refreshToken){
     throw new ApiError(401, "refresh Token is Expired or Used")
    }
 
 
    const options={
     httpOnly:true,
     secure:true
    }
 
 
    const {accessToken , newrefreshToken}=await generateAccessAndReferenshTokens(user._id)
 
    return res
    .status(200)
    .cookie("access Token", accessToken, options)
    .cookie("access Token", newrefreshToken, options)
    .json(
         new ApiResponse(
            200,
            {
             accessToken , refreshToken:newrefreshToken
            },
            "Access Token Refresh Successfuly"
         )
    )
   } catch (error) {
        throw new ApiError(401, error?.message||"Invalid Refresh Token")
   }


})


const changeCurrentPassword = asyncHandler(async(req , res) =>{

    const {oldPassword , newPassword, confPassword}=req.body

if(!(newPassword==confPassword)){
    throw new ApiError(401, "New Password and Confrim Passwrod Mismatch")

}

 const user=await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
  
  if(!isPasswordCorrect){
    throw new ApiError(401, "Invalid old Password")
  }

  user.password=newPassword
 await user.save({validateBeforeSave:false})

 return res
 .status(200)
 .json(new ApiResponse(200, {}, "Password Changed SccessFully"))
})


const getCurrentUser=asyncHandler(async(req, res) => {

  
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched"))
})



const updateAccountsDetails=asyncHandler(async(req ,res) => {

    const {username , email}=req.body


    if(!username || !email){
        throw new ApiError(400, "All field are required")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                username,
                email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, ("Account details Updated Successfuly")))
})



const updateUserAvatar=asyncHandler(async(req, res) =>{

   const avatarLocalPath= req.file?.path

   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar File is missing")

   }

 const avatar = await uploadOnCloudinary(avatarLocalPath)
 
   if(!avatar.url){
    throw new ApiError(400, "Error while Uplaodeing avatar file")

   }
const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
              
            }
        },
       

       {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, ("Avatar Updated Successfuly"))
)
    
})


  

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountsDetails,
    updateUserAvatar,
   

}