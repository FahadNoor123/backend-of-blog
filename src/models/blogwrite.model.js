import mongoose, { Schema } from "mongoose";

const blogWriteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentImage: {
      type: String, // cloudinary url
      
    },
    author: {
      type: String, // Assuming the username is stored in req.user.username
      
    },
    email: {
      type: String, // Assuming the username is stored in req.user.username
      
    },
  },
  {
    timestamps: true,
  }
);

export const Blog = mongoose.model("Blog", blogWriteSchema);
