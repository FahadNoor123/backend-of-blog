import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middlerware.js"; //for creating protected route

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name :"avatar",
            maxCount: 1
        },
        {
            name :"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )


router.route("/login").post(
    loginUser
)


// secure Routes
router.route("/logout").post(logoutUser)

// Protected route for user profile
router.route("/profile").get(verifyJWT, (req, res) => {
    // Access the authenticated user using req.user
    const user = req.user;
  
    // You can render a React component here, or send JSON data
    res.json({ message: 'Profile page', user });
  });


  
router.route("/refresh-token").post(refreshAccessToken)

export default router