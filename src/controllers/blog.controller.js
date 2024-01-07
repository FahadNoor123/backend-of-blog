
import {ApiError} from "../utils/ApiError.js"; //Api Error helps to throw errors
import {Blog} from "../models/blogwrite.model.js"; //getting Data from user model file
import { ApiResponse } from "../utils/ApiResponse.js";


const writeBlogController = async (req, res) => {
    try {
      // Extract data from the request body
      const { title, content } = req.body;
  
      // Validate input data (optional)
      if (!title) {

        throw new ApiError(400,"Title  are Required")
       
      }
      console.log("Data not receved in Backend")
      if (!content) {

        throw new ApiError(400," content are Required")
       
      }
  
      // Create a new blog post instance
      const newBlogPost = new Blog({
        title,
        content,
        author: req.user.username,
        email:req.user.email, // Assuming the username is available in the req object
      });
  
      // Save the new blog post to the database
      const savedPost = await newBlogPost.save();
  
      // Respond with the saved blog post
      // res.status(201)
      res.redirect("/yourblog")
      // .json(new ApiResponse(200, {}, "Blog has been uploaded"))
    } catch (error) {
      console.log('Error saving blog post:', error);
     
      res.status(500).json({ error: 'Internal Server Error whiel uploading' });
     
    }
  };
  
  export default writeBlogController;