import mongoose ,{Schema} from "mongoose";
import jwt from "jsonwebtoken"; // to generate access token and refresh token for user authentication and authorization
import bcrypt from "bcrypt"; // to encrypt the password


const userSchema = new mongoose.Schema(
    {
           username : {
                type : String,
                required : true,
                lowercase : true,
                unique : true,
                trim : true,
                index : true
           },
           
           email : {
                type : String,
                required : true,
                lowercase : true,
                unique : true,
                trim : true,
           },

           fullName : {
                type : String,
                required : true,
                trim : true,
                index : true,
           },

           avatar : {
                type : String, // cloudinary url for image
                required : true
           },

           coverImage : {
                type : String, // cloudinary url for image
           },

           watchHistory : [
                {
                    type : Schema.Types.ObjectId,
                    ref : "video"
                }
           ],

           password : {
                type : String,
                required : [true , "Password is required"],
           },

           refreshToken : {
               type : String,
           }
    }
,{timestamps : true})

// to encrypt the  password
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// to check if the pass is correct or not
userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password,this.password)
}


// to generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Fixed typo: expriresIn -> expiresIn
        }
    )
}

// to generate refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
} 

export const user = mongoose.model("user" , userSchema)