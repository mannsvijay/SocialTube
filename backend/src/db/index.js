import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        // We are using the variable directly because the Long String is complex
        // and adding `/${DB_NAME}` manually can break the URL parameters.
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB