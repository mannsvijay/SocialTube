import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // to add pagination feature to video model


const videoSchema = new mongoose.Schema(
     {
          videoFile : {
               type : String, // cloudinary url
               required : true,
          },

          thumbNail : {
               type : String, // cloudinary url
               required : true,
          },

          title : {
               type : String, 
               required : true,
          },

          description : {
               type : String, 
               required : true,
          },

          duration : {
               type : Number,
               required : true,
          },

          views : {
               type : Number,
               default : 0
          },
          
          isPublished : {
               type : Boolean,
               default : true,
          },

          owner : {
               type : Schema.Types.ObjectId,
               ref : "user"

          }


     }
,{timestamps : true})


// to add pagination feature to video model , pagination is required for fetching videos in chunks instead of fetching all videos at once which can cause performance issues and also to implement infinite scroll feature in frontend
videoSchema.plugin(mongooseAggregatePaginate)


// to create video model
export const video = mongoose.model("video",videoSchema)