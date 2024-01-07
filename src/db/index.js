import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async()=>{
    try{
    //   const connectionIntance=  await mongoose.connect(`${process.env.MONGODB-URL}/${DB_NAME}`)
        const contedIntance =await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jr4gxdf.mongodb.net/?retryWrites=true&w=majority`)
      console.log("DataBase Is Connected")
    }catch(error){
        console.log("Mongo DB connection erro", error)
        process.exit(1)
    }
}

export default connectDB