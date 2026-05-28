import mongoose , {Schema} from "mongoose";

const likeSchema =  new Schema ({
    video : {
        type : Schema.Types.ObjectId,
        ref : "video"
    },
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : "user"
    },
    comment : {
        type : Schema.Types.ObjectId,
        ref : "comment"
    },
    tweet : {
        type : Schema.Types.ObjectId,
        ref : "tweet"
    }


},{timestamps : true})


export const like = mongoose.model("like",likeSchema)