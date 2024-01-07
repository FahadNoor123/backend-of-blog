import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlerware.js"; //for creating protected route
import { Blog } from "../models/blogwrite.model.js";

import writeBlogController from "../controllers/blog.controller.js";

const blogRouter = Router();

blogRouter.route("/blogwrite").post(verifyJWT, writeBlogController);


blogRouter.route("/readblog").get( async (req, res) => {
    try {
      // Assuming you have a Blog model
      const blogs = await Blog.find().select("-author");

     
      
      // Send the list of blogs in the response
      res.json({ blogs });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  blogRouter.route("/yourblog").get(verifyJWT, async (req, res) => {
    try {
      // Assuming you have a Blog model
      const blogs = await Blog.find({ author: req.user.username }).select("-author");
  
      
      
      // Send the list of blogs in the response
      res.json({ blogs });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
 
  // Handle GET request to fetch blog details
  blogRouter.get('/:blogId', async (req, res) => {
    const { blogId } = req.params;
    
  
    try {
      const blog = await Blog.findById(blogId);
  
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      res.json(blog);
    } catch (error) {
      console.error('Error fetching blog details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


   
  blogRouter.route("/:blogId").delete(verifyJWT, async(req, res) =>{
    const { blogId } = req.params;
    
  
    try {
      const blog = await Blog.findByIdAndDelete(blogId);
  
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      res.status(201).json({ message: 'blog deleted succefuly' });
    } catch (error) {
      console.error('Error fetching blog details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }

  });

   
  blogRouter.route("/:blogId").patch(verifyJWT, async(req, res) =>{
    const { blogId } = req.params;
    const { title, content } = req.body;
  
    try {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        { title, content }, // Update these fields as needed
        { new: true } // This option returns the updated document
      )
  
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      res.status(201).json({ message: 'blog updated succesfully' });
    } catch (error) {
      console.error('Error fetching blog details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }

  });
  
  

export default blogRouter;
